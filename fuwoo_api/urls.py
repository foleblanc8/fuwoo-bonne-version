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
    create_checkout_session, stripe_webhook,
    provider_submit_work, client_release_payment, client_dispute_work, request_cancellation,
    provider_tier,
    submit_identity, PortfolioPhotoViewSet, ProviderCredentialViewSet,
    download_contract,
    CRMViewSet, crm_stats, crm_revenue_chart, crm_notes, crm_note_detail,
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
router.register(r'portfolio', PortfolioPhotoViewSet, basename='portfolio')
router.register(r'credentials', ProviderCredentialViewSet, basename='credential')
router.register(r'crm', CRMViewSet, basename='crm')

urlpatterns = [
    # CRM custom paths AVANT le router (évite que crm/<pk>/ intercepte crm/stats/ etc.)
    path('crm/stats/', crm_stats, name='crm_stats'),
    path('crm/revenue-chart/', crm_revenue_chart, name='crm_revenue_chart'),
    path('crm/<int:client_pk>/notes/', crm_notes, name='crm_notes'),
    path('crm/<int:client_pk>/notes/<int:note_pk>/', crm_note_detail, name='crm_note_detail'),

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

    # Paiements Stripe
    path('payments/create-checkout/', create_checkout_session, name='create_checkout'),
    path('payments/webhook/', stripe_webhook, name='stripe_webhook'),
    path('payments/submit-work/', provider_submit_work, name='provider_submit_work'),
    path('payments/release/', client_release_payment, name='client_release_payment'),
    path('payments/dispute/', client_dispute_work, name='client_dispute_work'),
    path('payments/cancel-request/', request_cancellation, name='request_cancellation'),

    # Palier de commission prestataire
    path('profile/tier/', provider_tier, name='provider_tier'),

    # Vérification d'identité
    path('auth/submit-identity/', submit_identity, name='submit_identity'),

    # Contrats PDF
    path('contracts/<int:bid_id>/', download_contract, name='download_contract'),
]