# fuwoo_api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, register, profile, become_provider,
    UserViewSet, ServiceCategoryViewSet, ServiceViewSet, 
    BookingViewSet, ReviewViewSet, MessageViewSet, 
    NotificationViewSet, AvailabilityViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'categories', ServiceCategoryViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'availabilities', AvailabilityViewSet, basename='availability')

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentification JWT
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', register, name='register'),
    
    # Profil utilisateur
    path('profile/', profile, name='profile'),
    path('become-provider/', become_provider, name='become_provider'),
]