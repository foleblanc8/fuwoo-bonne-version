# fuwoo_api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, register, google_auth, profile, become_provider,
    UserViewSet, ServiceCategoryViewSet, ServiceViewSet,
    BookingViewSet, ReviewViewSet, MessageViewSet,
    NotificationViewSet, AvailabilityViewSet,
    ServiceRequestViewSet, BidViewSet,
    password_reset_request, password_reset_confirm,
    verify_email, resend_verification,
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'categories', ServiceCategoryViewSet)
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'availabilities', AvailabilityViewSet, basename='availability')
router.register(r'service-requests', ServiceRequestViewSet, basename='service-request')
router.register(r'bids', BidViewSet, basename='bid')

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentification JWT
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', register, name='register'),
    path('auth/google/', google_auth, name='google_auth'),
    
    # Profil utilisateur
    path('profile/', profile, name='profile'),
    path('become-provider/', become_provider, name='become_provider'),

    # Mot de passe oublié
    path('auth/password-reset/', password_reset_request, name='password_reset_request'),
    path('auth/password-reset-confirm/', password_reset_confirm, name='password_reset_confirm'),

    # Vérification email
    path('auth/verify-email/', verify_email, name='verify_email'),
    path('auth/resend-verification/', resend_verification, name='resend_verification'),
]