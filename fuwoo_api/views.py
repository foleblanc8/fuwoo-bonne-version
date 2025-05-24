# fuwoo_api/views.py

from rest_framework import viewsets, permissions, status, filters, serializers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q, Avg
from django.db import IntegrityError
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    ServiceCategory, Service, Booking, Review, 
    Message, Notification, Availability
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer, ServiceCategorySerializer,
    ServiceSerializer, BookingSerializer, ReviewSerializer,
    MessageSerializer, NotificationSerializer, AvailabilitySerializer
)
from .permissions import IsOwnerOrReadOnly, IsProviderOrReadOnly

User = get_user_model()

# Serializer personnalisé pour le login JWT
class MyTokenObtainPairSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            
            if not user:
                raise serializers.ValidationError('Identifiants invalides')
            
            if not user.is_active:
                raise serializers.ValidationError('Compte désactivé')
            
            refresh = RefreshToken.for_user(user)
            
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }
        else:
            raise serializers.ValidationError('Username et password requis')

# Vue de login personnalisée
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

# Vue d'inscription (gardez votre version mais améliorée)
@api_view(['POST'])
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
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [IsProviderOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'provider', 'service_area', 'instant_booking']
    search_fields = ['title', 'description']
    ordering_fields = ['price', 'rating', 'created_at']
    
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