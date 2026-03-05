# fuwoo_api/views.py

import json
import ssl
import urllib.request
import certifi

_ssl_ctx = ssl.create_default_context(cafile=certifi.where())
from rest_framework import viewsets, permissions, status, filters, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q, Avg
from django.db import IntegrityError
from django.utils.timezone import now
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    ServiceCategory, Service, Booking, Review,
    Message, Notification, Availability,
    ServiceRequest, ServiceRequestImage, Bid,
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer, ServiceCategorySerializer,
    ServiceSerializer, BookingSerializer, ReviewSerializer,
    MessageSerializer, NotificationSerializer, AvailabilitySerializer,
    ServiceRequestSerializer, BidSerializer,
)
from .permissions import IsOwnerOrReadOnly, IsProviderOrReadOnly
from .utils import haversine_distance

PROVIDER_NOTIFICATION_RADIUS_KM = 100

User = get_user_model()

# Serializer personnalisé pour le login JWT
class MyTokenObtainPairSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs.get('username')
        password   = attrs.get('password')

        if not identifier or not password:
            raise serializers.ValidationError('Identifiant et mot de passe requis')

        # Si l'identifiant contient un @, on cherche d'abord par email
        user = None
        if '@' in identifier:
            try:
                user_obj = User.objects.get(email__iexact=identifier)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        # Sinon (ou si l'email n'a pas matché), on essaie par username
        if user is None:
            user = authenticate(username=identifier, password=password)

        if not user:
            raise serializers.ValidationError('Identifiants invalides')

        if not user.is_active:
            raise serializers.ValidationError('Compte désactivé')

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access':  str(refresh.access_token),
            'user':    UserSerializer(user).data,
        }

# Vue de login personnalisée
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

# Vue d'inscription (gardez votre version mais améliorée)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response(
                {"detail": "Nom d'utilisateur ou email déjà utilisé."},
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Connexion via Google OAuth
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def google_auth(request):
    access_token = request.data.get('access_token')
    if not access_token:
        return Response({'error': 'Token manquant'}, status=status.HTTP_400_BAD_REQUEST)

    # Récupérer les infos utilisateur depuis Google
    try:
        req = urllib.request.Request(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {access_token}'},
        )
        with urllib.request.urlopen(req, timeout=5, context=_ssl_ctx) as resp:
            info = json.loads(resp.read())
    except Exception:
        return Response({'error': 'Token Google invalide'}, status=status.HTTP_400_BAD_REQUEST)

    email = info.get('email')
    if not email:
        return Response({'error': 'Email non disponible'}, status=status.HTTP_400_BAD_REQUEST)

    # Trouver ou créer l'utilisateur
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        base = email.split('@')[0]
        username = base
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f'{base}{counter}'
            counter += 1
        user = User(
            username=username,
            email=email,
            first_name=info.get('given_name', ''),
            last_name=info.get('family_name', ''),
        )
        user.set_unusable_password()
        user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
        'user':    UserSerializer(user).data,
    })

# Vue de profil (gardez votre version mais utilisez UserSerializer)
@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = UserSerializer(user, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Devenir prestataire
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def become_provider(request):
    user = request.user
    if user.role == 'prestataire':
        return Response({'detail': 'Vous êtes déjà prestataire.'}, 
                      status=status.HTTP_400_BAD_REQUEST)
    
    user.role = 'prestataire'
    user.save()
    return Response(UserSerializer(user).data)

# ViewSets pour les autres modèles
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['create', 'list']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

class ServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsProviderOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'provider', 'service_area', 'instant_booking']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'rating', 'created_at']

    def get_queryset(self):
        user = self.request.user
        provider_param = self.request.query_params.get('provider')
        # Prestataire viewing their own services: include inactive ones
        if user.is_authenticated and user.role == 'prestataire':
            try:
                if provider_param and int(provider_param) == user.id:
                    return Service.objects.filter(provider=user)
            except (ValueError, TypeError):
                pass
        return Service.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        service = self.get_object()
        reviews = Review.objects.filter(service=service)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'date']
    ordering_fields = ['date', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            return Booking.objects.filter(client=user)
        elif user.role == 'prestataire':
            return Booking.objects.filter(provider=user)
        return Booking.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        booking = self.get_object()
        if request.user != booking.provider:
            return Response({'detail': 'Non autorisé'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        booking.status = 'confirmed'
        booking.save()
        
        # Créer une notification
        Notification.objects.create(
            user=booking.client,
            type='booking_confirmed',
            title='Réservation confirmée',
            message=f'Votre réservation pour {booking.service.title} a été confirmée.',
            related_booking=booking
        )
        
        return Response(BookingSerializer(booking).data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if request.user not in [booking.client, booking.provider]:
            return Response({'detail': 'Non autorisé'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        booking.status = 'cancelled'
        booking.save()
        
        # Notifier l'autre partie
        other_user = booking.provider if request.user == booking.client else booking.client
        Notification.objects.create(
            user=other_user,
            type='booking_cancelled',
            title='Réservation annulée',
            message=f'La réservation pour {booking.service.title} a été annulée.',
            related_booking=booking
        )
        
        return Response(BookingSerializer(booking).data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        booking = self.get_object()
        if request.user != booking.provider:
            return Response({'detail': 'Non autorisé'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        booking.status = 'completed'
        booking.save()
        
        Notification.objects.create(
            user=booking.client,
            type='booking_completed',
            title='Service terminé',
            message=f'Le service {booking.service.title} a été complété. N\'oubliez pas de laisser un avis!',
            related_booking=booking
        )
        
        return Response(BookingSerializer(booking).data)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Review.objects.filter(client=self.request.user)
    
    def perform_create(self, serializer):
        booking_id = self.request.data.get('booking')
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Réservation introuvable.")
            
        if booking.client != self.request.user:
            raise serializers.ValidationError("Vous ne pouvez pas évaluer cette réservation.")
        if booking.status != 'completed':
            raise serializers.ValidationError("Le service doit être terminé pour laisser un avis.")
        
        serializer.save(
            client=self.request.user,
            provider=booking.provider,
            service=booking.service,
            booking=booking
        )
        
        # Mettre à jour la note du prestataire
        provider = booking.provider
        reviews = Review.objects.filter(provider=provider)
        provider.rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        provider.total_reviews = reviews.count()
        provider.save()

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('created_at')
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)
    
    @action(detail=False, methods=['get'])
    def conversations(self, request):
        # Retourner les conversations uniques
        user = request.user
        conversations = Message.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).values('sender', 'receiver').distinct()
        
        return Response(conversations)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'Notification marquée comme lue'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'Toutes les notifications ont été marquées comme lues'})

class AvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'prestataire':
            return Availability.objects.filter(provider=self.request.user)
        return Availability.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'prestataire':
            raise serializers.ValidationError("Seuls les prestataires peuvent définir leurs disponibilités.")
        serializer.save(provider=self.request.user)


class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            return ServiceRequest.objects.filter(client=user).order_by('-created_at')
        return ServiceRequest.objects.filter(
            status='open', submission_deadline__gt=now()
        ).order_by('submission_deadline')

    def perform_create(self, serializer):
        sr = serializer.save(client=self.request.user)
        for img in self.request.FILES.getlist('images'):
            ServiceRequestImage.objects.create(service_request=sr, image=img)
        self._notify_nearby_providers(sr)

    def _notify_nearby_providers(self, service_request):
        """Notifie tous les prestataires dans un rayon de 100km."""
        if service_request.latitude is None or service_request.longitude is None:
            return

        providers = User.objects.filter(
            role='prestataire',
            latitude__isnull=False,
            longitude__isnull=False,
        ).exclude(id=self.request.user.id)

        notifications = []
        for provider in providers:
            distance = haversine_distance(
                service_request.latitude, service_request.longitude,
                provider.latitude, provider.longitude,
            )
            if distance <= PROVIDER_NOTIFICATION_RADIUS_KM:
                notifications.append(Notification(
                    user=provider,
                    type='new_service_request',
                    title='Nouvelle demande près de chez vous',
                    message=(
                        f'"{service_request.title}" — '
                        f'{service_request.service_area} '
                        f'({int(distance)} km de vous)'
                    ),
                    related_service_request=service_request,
                ))

        if notifications:
            Notification.objects.bulk_create(notifications)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        sr = self.get_object()
        if sr.client != request.user:
            return Response({'error': 'Non autorisé'}, status=403)
        sr.status = 'cancelled'
        sr.save()
        return Response({'status': 'cancelled'})


class BidViewSet(viewsets.ModelViewSet):
    serializer_class = BidSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'prestataire':
            return Bid.objects.filter(provider=user).order_by('-created_at')
        qs = Bid.objects.filter(service_request__client=user).order_by('-created_at')
        service_request_id = self.request.query_params.get('service_request')
        if service_request_id:
            qs = qs.filter(service_request_id=service_request_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'prestataire':
            raise serializers.ValidationError('Seuls les prestataires peuvent soumettre une offre.')
        sr = serializer.validated_data['service_request']
        if sr.status != 'open':
            raise serializers.ValidationError("Cette demande n'est plus ouverte.")
        if sr.submission_deadline < now():
            raise serializers.ValidationError('La période de soumission est terminée.')
        serializer.save(provider=user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        bid = self.get_object()
        sr = bid.service_request
        if sr.client != request.user:
            return Response({'error': 'Non autorisé'}, status=403)
        if sr.status != 'open':
            return Response({'error': 'Demande non ouverte'}, status=400)
        bid.status = 'accepted'
        bid.save()
        sr.bids.exclude(pk=bid.pk).update(status='rejected')
        sr.status = 'awarded'
        sr.save()
        return Response({'status': 'accepted'})
        serializer.save(provider=self.request.user)