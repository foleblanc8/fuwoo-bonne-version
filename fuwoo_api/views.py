# fuwoo_api/views.py

import json
import ssl
import urllib.request
import certifi
import stripe
from decimal import Decimal

_ssl_ctx = ssl.create_default_context(cafile=certifi.where())
from rest_framework import viewsets, permissions, status, filters, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from .emails import (
    send_email_verification, send_password_reset, send_welcome,
    send_bid_received, send_bid_accepted, send_booking_confirmed,
    send_identity_verified, send_identity_rejected,
)
from django.conf import settings as django_settings
from django.db.models import Q, Avg
from django.db import IntegrityError
from django.utils.timezone import now
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    ServiceCategory, Service, Booking, Review,
    Message, Notification, Availability,
    ServiceRequest, ServiceRequestImage, Bid, Payment, PortfolioPhoto,
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer, ServiceCategorySerializer,
    ServiceSerializer, BookingSerializer, ReviewSerializer,
    MessageSerializer, NotificationSerializer, AvailabilitySerializer,
    ServiceRequestSerializer, BidSerializer, PortfolioPhotoSerializer,
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
            # Envoyer email de bienvenue + vérification
            try:
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                link = f"{django_settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"
                send_email_verification(user, link)
                send_welcome(user)
            except Exception:
                pass  # L'inscription ne doit pas échouer si l'email ne part pas
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
    if user.has_provider_profile:
        return Response({'detail': 'Vous avez déjà un profil prestataire.'},
                      status=status.HTTP_400_BAD_REQUEST)

    user.has_provider_profile = True
    user.role = 'prestataire'   # maintenu pour compatibilité FK
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
        if user.is_authenticated and user.has_provider_profile:
            try:
                if provider_param and int(provider_param) == user.id:
                    return Service.objects.filter(provider=user)
            except (ValueError, TypeError):
                pass
        qs = Service.objects.filter(is_active=True)
        qp = self.request.query_params

        for k, field in [('min_price', 'price__gte'), ('max_price', 'price__lte'), ('min_rating', 'rating__gte')]:
            v = qp.get(k)
            if v:
                try:
                    qs = qs.filter(**{field: v})
                except (ValueError, TypeError):
                    pass

        # Filtre par ville (icontains sur service_area)
        city = qp.get('city')
        if city:
            qs = qs.filter(service_area__icontains=city)

        # Filtre par géolocalisation (haversine sur les coords du prestataire)
        lat = qp.get('lat')
        lng = qp.get('lng')
        radius = qp.get('radius', '50')  # km, défaut 50
        if lat and lng:
            try:
                lat_f, lng_f, radius_f = float(lat), float(lng), float(radius)
                ids = [
                    s.id for s in qs.select_related('provider')
                    if s.provider.latitude is not None and s.provider.longitude is not None
                    and haversine_distance(lat_f, lng_f, s.provider.latitude, s.provider.longitude) <= radius_f
                ]
                qs = qs.filter(id__in=ids)
            except (ValueError, TypeError):
                pass

        return qs

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        service = self.get_object()
        reviews = Review.objects.filter(service=service)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request, pk=None):
        service = self.get_object()
        if service.provider != request.user:
            return Response({'detail': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        image = request.FILES.get('image')
        if not image:
            return Response({'detail': 'Image manquante'}, status=status.HTTP_400_BAD_REQUEST)
        is_primary = request.data.get('is_primary', 'false').lower() == 'true'
        # Si cette image est primaire, retirer le flag des autres
        if is_primary:
            service.images.update(is_primary=False)
        si = ServiceImage.objects.create(service=service, image=image, is_primary=is_primary)
        from .serializers import ServiceImageSerializer as SIS
        return Response(SIS(si).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path=r'images/(?P<image_id>\d+)')
    def delete_image(self, request, pk=None, image_id=None):
        service = self.get_object()
        if service.provider != request.user:
            return Response({'detail': 'Non autorisé'}, status=status.HTTP_403_FORBIDDEN)
        try:
            img = ServiceImage.objects.get(id=image_id, service=service)
            img.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ServiceImage.DoesNotExist:
            return Response({'detail': 'Image introuvable'}, status=status.HTTP_404_NOT_FOUND)

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'date']
    ordering_fields = ['date', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        mode = self.request.query_params.get('as')
        if mode == 'provider' and user.has_provider_profile:
            return Booking.objects.filter(provider=user)
        # Par défaut (mode client ou non spécifié) : réservations en tant que client
        return Booking.objects.filter(client=user)
    
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

        Notification.objects.create(
            user=booking.client,
            type='booking_confirmed',
            title='Réservation confirmée',
            message=f'Votre réservation pour {booking.service.title} a été confirmée.',
            related_booking=booking
        )
        # Email au client
        provider_name = booking.provider.get_full_name() or booking.provider.username
        send_booking_confirmed(
            booking.client,
            booking.service.title,
            provider_name,
            str(booking.date),
            booking.service_address or '',
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
    
    @action(detail=True, methods=['get'], url_path='review')
    def review(self, request, pk=None):
        booking = self.get_object()
        if booking.client != request.user:
            return Response({'detail': 'Non autorisé.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            review = Review.objects.get(booking=booking)
            return Response(ReviewSerializer(review).data)
        except Review.DoesNotExist:
            return Response(None, status=status.HTTP_200_OK)

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        provider_id = self.request.query_params.get('provider_id')
        if provider_id:
            return Review.objects.filter(provider_id=provider_id).select_related('client')
        if self.request.user.is_authenticated:
            return Review.objects.filter(client=self.request.user)
        return Review.objects.none()
    
    def perform_create(self, serializer):
        booking = serializer.validated_data['booking']

        if booking.client != self.request.user:
            raise serializers.ValidationError("Vous ne pouvez pas évaluer cette réservation.")
        if booking.status != 'completed':
            raise serializers.ValidationError("Le service doit être terminé pour laisser un avis.")

        try:
            review = serializer.save(
                client=self.request.user,
                provider=booking.provider,
                service=booking.service,
            )
        except IntegrityError:
            raise serializers.ValidationError("Vous avez déjà laissé un avis pour cette réservation.")

        # Mettre à jour la note du prestataire
        provider = booking.provider
        provider_reviews = Review.objects.filter(provider=provider)
        provider.rating = provider_reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        provider.total_reviews = provider_reviews.count()
        provider.save(update_fields=['rating', 'total_reviews'])

        # Mettre à jour la note du service
        service = booking.service
        service_reviews = Review.objects.filter(service=service)
        service.rating = service_reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        service.save(update_fields=['rating'])

        # Notifier le prestataire
        client_name = self.request.user.get_full_name() or self.request.user.username
        Notification.objects.create(
            user=provider,
            type='new_review',
            title='Nouvel avis reçu',
            message=f'{client_name} vous a laissé un avis {review.rating}/5.',
            related_booking=booking,
        )

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
        if self.request.user.has_provider_profile:
            return Availability.objects.filter(provider=self.request.user)
        return Availability.objects.none()

    def perform_create(self, serializer):
        if not self.request.user.has_provider_profile:
            raise serializers.ValidationError("Activez votre profil prestataire pour définir vos disponibilités.")
        serializer.save(provider=self.request.user)


class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        mode = self.request.query_params.get('as')
        if mode == 'provider' and user.has_provider_profile:
            # Filtrer par catégories offertes par ce prestataire
            provider_category_ids = user.services.values_list('category_id', flat=True).distinct()
            qs = ServiceRequest.objects.filter(
                status='open', submission_deadline__gt=now()
            )
            # Si le prestataire a des catégories définies, filtrer; sinon montrer tout
            if provider_category_ids:
                qs = qs.filter(
                    Q(category__isnull=True) | Q(category_id__in=provider_category_ids)
                )
            return qs.order_by('submission_deadline')
        # Par défaut (mode client) : propres demandes
        return ServiceRequest.objects.filter(client=user).order_by('-created_at')

    def perform_create(self, serializer):
        sr = serializer.save(client=self.request.user)
        for img in self.request.FILES.getlist('images'):
            ServiceRequestImage.objects.create(service_request=sr, image=img)
        self._notify_nearby_providers(sr)

    def _notify_nearby_providers(self, service_request):
        """Notifie les prestataires dans un rayon de 100km avec la bonne catégorie."""
        if service_request.latitude is None or service_request.longitude is None:
            return

        providers_qs = User.objects.filter(
            has_provider_profile=True,
            latitude__isnull=False,
            longitude__isnull=False,
        ).exclude(id=self.request.user.id)

        # Filtrer par catégorie si la demande en a une
        if service_request.category_id:
            providers_qs = providers_qs.filter(
                services__category_id=service_request.category_id
            ).distinct()

        notifications = []
        for provider in providers_qs:
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
        mode = self.request.query_params.get('as')
        if mode == 'provider' and user.has_provider_profile:
            return Bid.objects.filter(provider=user).order_by('-created_at')
        # Par défaut (mode client) : offres reçues sur ses demandes
        qs = Bid.objects.filter(service_request__client=user).order_by('-created_at')
        service_request_id = self.request.query_params.get('service_request')
        if service_request_id:
            qs = qs.filter(service_request_id=service_request_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if not user.has_provider_profile:
            raise serializers.ValidationError('Activez votre profil prestataire pour soumettre une offre.')
        sr = serializer.validated_data['service_request']
        if sr.status != 'open':
            raise serializers.ValidationError("Cette demande n'est plus ouverte.")
        if sr.submission_deadline < now():
            raise serializers.ValidationError('La période de soumission est terminée.')
        try:
            from django.db import transaction as db_transaction
            with db_transaction.atomic():
                bid = serializer.save(provider=user)
        except IntegrityError:
            raise serializers.ValidationError('Vous avez déjà soumis une offre pour cette demande.')
        # Email au client : nouvelle offre reçue
        provider_name = user.get_full_name() or user.username
        send_bid_received(
            sr.client, sr.title, provider_name,
            str(bid.price), bid.price_unit,
        )

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
        # Email au prestataire : offre acceptée
        client_name = request.user.get_full_name() or request.user.username
        send_bid_accepted(
            bid.provider, sr.title, client_name,
            str(bid.price), bid.price_unit,
        )
        return Response({'status': 'accepted'})


# ─── Mot de passe oublié ──────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_request(request):
    email = request.data.get('email', '')
    try:
        user = User.objects.get(email=email)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        link = f"{django_settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"
        send_password_reset(user, link)
    except User.DoesNotExist:
        pass  # Ne pas révéler si l'email existe
    return Response({'detail': 'Si ce courriel est enregistré, un lien a été envoyé.'})


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset_confirm(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    password = request.data.get('password')
    if not uid or not token or not password:
        return Response({'detail': 'Données manquantes.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        pk = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=pk)
        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Lien invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save()
        return Response({'detail': 'Mot de passe modifié avec succès.'})
    except Exception:
        return Response({'detail': 'Lien invalide.'}, status=status.HTTP_400_BAD_REQUEST)


# ─── Vérification email ───────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    uid = request.query_params.get('uid')
    token = request.query_params.get('token')
    if not uid or not token:
        return Response({'detail': 'Paramètres manquants.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        pk = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=pk)
        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Lien invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)
        user.email_verified = True
        user.save()
        return Response({'detail': 'Adresse courriel vérifiée avec succès.'})
    except Exception:
        return Response({'detail': 'Lien invalide.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification(request):
    user = request.user
    if user.email_verified:
        return Response({'detail': 'Votre courriel est déjà vérifié.'})
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    link = f"{django_settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"
    send_email_verification(user, link)
    return Response({'detail': 'Email de vérification envoyé.'})


# ─── Portfolio Photos ─────────────────────────────────────────────────────────

class PortfolioPhotoViewSet(viewsets.ModelViewSet):
    serializer_class   = PortfolioPhotoSerializer
    parser_classes     = [MultiPartParser, FormParser, JSONParser]
    MAX_PHOTOS         = 10

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = PortfolioPhoto.objects.all()
        provider_id = self.request.query_params.get('provider')
        if provider_id:
            qs = qs.filter(provider_id=provider_id)
        elif self.request.user.is_authenticated:
            qs = qs.filter(provider=self.request.user)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if not user.has_provider_profile:
            raise serializers.ValidationError('Profil prestataire requis.')
        if PortfolioPhoto.objects.filter(provider=user).count() >= self.MAX_PHOTOS:
            raise serializers.ValidationError(f'Maximum {self.MAX_PHOTOS} photos de portfolio autorisées.')
        serializer.save(provider=user)

    def perform_destroy(self, instance):
        if instance.provider != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Non autorisé.')
        instance.image.delete(save=False)
        instance.delete()


# ─── Vérification d'identité ──────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_identity(request):
    """
    Le prestataire soumet un document d'identité (PDF, JPG, PNG).
    Passe le statut à 'pending' pour review admin.
    """
    user = request.user
    if not user.has_provider_profile:
        return Response({'detail': 'Profil prestataire requis.'}, status=status.HTTP_403_FORBIDDEN)

    if user.identity_status == 'verified':
        return Response({'detail': 'Votre identité est déjà vérifiée.'})

    doc = request.FILES.get('identity_document')
    if not doc:
        return Response({'detail': 'Aucun fichier fourni.'}, status=status.HTTP_400_BAD_REQUEST)

    allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if doc.content_type not in allowed_types:
        return Response({'detail': 'Format accepté : JPG, PNG, WebP ou PDF.'}, status=status.HTTP_400_BAD_REQUEST)

    if doc.size > 10 * 1024 * 1024:
        return Response({'detail': 'Le fichier ne doit pas dépasser 10 Mo.'}, status=status.HTTP_400_BAD_REQUEST)

    user.identity_document = doc
    user.identity_status   = 'pending'
    user.identity_rejection_reason = ''
    user.save(update_fields=['identity_document', 'identity_status', 'identity_rejection_reason'])

    return Response({'detail': 'Document soumis. Nous l\'examinerons sous 24–48h.', 'identity_status': 'pending'})


# ─── Paiements Stripe ─────────────────────────────────────────────────────────

def _get_commission_rate(amount: Decimal) -> Decimal:
    """Retourne le taux de commission selon les paliers configurés."""
    tiers = django_settings.STRIPE_COMMISSION_TIERS
    for threshold, rate in tiers:
        if amount <= threshold:
            return Decimal(str(rate))
    return Decimal(str(tiers[-1][1]))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    """
    Crée une session Stripe Checkout pour payer une offre acceptée.
    Body: { "bid_id": <int> }
    """
    stripe.api_key = django_settings.STRIPE_SECRET_KEY

    bid_id = request.data.get('bid_id')
    if not bid_id:
        return Response({'detail': 'bid_id requis.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        bid = Bid.objects.select_related('service_request__client', 'provider').get(pk=bid_id)
    except Bid.DoesNotExist:
        return Response({'detail': 'Offre introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if bid.service_request.client != request.user:
        return Response({'detail': 'Non autorisé.'}, status=status.HTTP_403_FORBIDDEN)

    if bid.status != 'accepted':
        return Response({'detail': "L'offre doit être acceptée avant le paiement."}, status=status.HTTP_400_BAD_REQUEST)

    # Vérifier si un paiement existe déjà
    if hasattr(bid, 'payment') and bid.payment.status == 'completed':
        return Response({'detail': 'Cette offre est déjà payée.'}, status=status.HTTP_400_BAD_REQUEST)

    amount = Decimal(str(bid.price))
    rate   = _get_commission_rate(amount)
    commission = (amount * rate).quantize(Decimal('0.01'))
    provider_amount = amount - commission

    frontend_url = django_settings.FRONTEND_URL

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'cad',
                    'unit_amount': int(amount * 100),  # en centimes
                    'product_data': {
                        'name': bid.service_request.title,
                        'description': (
                            f"Prestataire : {bid.provider.get_full_name() or bid.provider.username} · "
                            f"Commission Fuwoo {int(rate * 100)}% incluse"
                        ),
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{frontend_url}/dashboard?payment=success&bid={bid.id}",
            cancel_url=f"{frontend_url}/dashboard?payment=cancelled&bid={bid.id}",
            metadata={
                'bid_id':         str(bid.id),
                'client_id':      str(request.user.id),
                'provider_id':    str(bid.provider.id),
                'commission_rate': str(rate),
                'commission_amount': str(commission),
                'provider_amount':   str(provider_amount),
            },
        )
    except stripe.StripeError as e:
        return Response({'detail': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

    # Créer (ou mettre à jour) l'objet Payment en base
    Payment.objects.update_or_create(
        bid=bid,
        defaults={
            'client':            request.user,
            'provider':          bid.provider,
            'amount':            amount,
            'commission_rate':   rate,
            'commission_amount': commission,
            'provider_amount':   provider_amount,
            'stripe_session_id': session.id,
            'status':            'pending',
        },
    )

    return Response({'checkout_url': session.url})


@api_view(['POST'])
@permission_classes([])  # Stripe ne s'authentifie pas
def stripe_webhook(request):
    """Webhook Stripe — confirme le paiement et notifie les parties."""
    stripe.api_key = django_settings.STRIPE_SECRET_KEY
    webhook_secret = django_settings.STRIPE_WEBHOOK_SECRET

    payload   = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except (ValueError, stripe.SignatureVerificationError):
        return Response({'detail': 'Signature invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    if event['type'] == 'checkout.session.completed':
        session  = event['data']['object']
        meta     = session.get('metadata', {})
        bid_id   = meta.get('bid_id')

        try:
            payment = Payment.objects.get(stripe_session_id=session['id'])
            payment.stripe_payment_intent_id = session.get('payment_intent', '')
            payment.status       = 'completed'
            payment.completed_at = now()
            payment.save()

            # Notifier le prestataire
            Notification.objects.create(
                user=payment.provider,
                type='booking_confirmed',
                title='Paiement reçu !',
                message=(
                    f'Le client a payé {payment.amount} $ pour "{payment.bid.service_request.title}". '
                    f'Vous recevrez {payment.provider_amount} $ après déduction de la commission.'
                ),
            )
            # Notifier le client
            Notification.objects.create(
                user=payment.client,
                type='booking_confirmed',
                title='Paiement confirmé',
                message=f'Votre paiement de {payment.amount} $ a été confirmé. Le prestataire a été notifié.',
            )
        except Payment.DoesNotExist:
            pass  # Peut arriver si le webhook arrive avant la réponse du create_checkout

    return Response({'status': 'ok'})


# ─── Contrat PDF ──────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_contract(request, bid_id):
    """
    Retourne le contrat PDF pour une soumission acceptée.
    Accessible par le client ou le prestataire concerné.
    """
    from .contract import generate_contract_pdf
    from django.http import HttpResponse

    bid = get_object_or_404(
        Bid.objects.select_related('service_request', 'service_request__client',
                                   'service_request__category', 'provider'),
        pk=bid_id,
        status='accepted',
    )

    # Seuls le client et le prestataire peuvent télécharger
    user = request.user
    if user != bid.service_request.client and user != bid.provider:
        return Response({'detail': 'Accès refusé.'}, status=403)

    pdf_bytes = generate_contract_pdf(bid)
    filename = f"contrat_fuwoo_{bid.id:06d}.pdf"

    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response