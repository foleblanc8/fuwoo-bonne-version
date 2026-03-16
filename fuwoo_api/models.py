# fuwoo_api/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('prestataire', 'Prestataire'),
    )
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='client',
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    # Géolocalisation
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Profil prestataire activé (indépendant du rôle — tout utilisateur peut l'activer)
    has_provider_profile = models.BooleanField(default=False)

    # Vérification email
    email_verified = models.BooleanField(default=False)

    # Pour les prestataires
    is_verified = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Vérification d'identité
    IDENTITY_STATUS_CHOICES = [
        ('not_submitted', 'Non soumis'),
        ('pending',       'En attente de révision'),
        ('verified',      'Vérifié'),
        ('rejected',      'Rejeté'),
    ]
    identity_document        = models.FileField(upload_to='identity_docs/', blank=True, null=True)
    identity_status          = models.CharField(max_length=20, choices=IDENTITY_STATUS_CHOICES, default='not_submitted')
    identity_rejection_reason = models.TextField(blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class ServiceCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50)  # Pour stocker le nom de l'icône
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Service Categories"
    
    def __str__(self):
        return self.name


class Service(models.Model):
    provider = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='services',
        limit_choices_to={'role': 'prestataire'}
    )
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_unit = models.CharField(max_length=50, blank=True, default='soumission')
    duration = models.IntegerField(help_text="Durée estimée en minutes", default=60)

    # Localisation
    service_area = models.CharField(max_length=100, blank=True, default='')
    max_distance = models.IntegerField(help_text="Distance max en km", default=100)
    
    # Disponibilité
    is_active = models.BooleanField(default=True)
    instant_booking = models.BooleanField(default=False)
    
    # Statistiques
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_bookings = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.provider.username}"


class ServiceImage(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='services/')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class Availability(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Lundi'),
        (1, 'Mardi'),
        (2, 'Mercredi'),
        (3, 'Jeudi'),
        (4, 'Vendredi'),
        (5, 'Samedi'),
        (6, 'Dimanche'),
    ]
    
    provider = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE,
        related_name='availabilities',
        limit_choices_to={'role': 'prestataire'}
    )
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['provider', 'day_of_week', 'start_time']


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('confirmed', 'Confirmée'),
        ('in_progress', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    ]
    
    client = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE,
        related_name='bookings_as_client',
        limit_choices_to={'role': 'client'}
    )
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    provider = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='bookings_as_provider',
        limit_choices_to={'role': 'prestataire'}
    )
    
    # Détails de la réservation
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Adresse de service
    service_address = models.TextField()
    service_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    service_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Prix et paiement
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=50, blank=True)
    
    # Notes
    client_notes = models.TextField(blank=True)
    provider_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Booking #{self.id} - {self.service.title}"


class Review(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    client = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='reviews_given'
    )
    provider = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='reviews_received'
    )
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    
    # Évaluations détaillées
    quality_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    punctuality_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    communication_rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['booking', 'client']
    
    def __str__(self):
        return f"Review for {self.service.title} - {self.rating}/5"


class Message(models.Model):
    sender = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    receiver = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='received_messages'
    )
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='messages',
        null=True, blank=True
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender} to {self.receiver}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('booking_request', 'Demande de réservation'),
        ('booking_confirmed', 'Réservation confirmée'),
        ('booking_cancelled', 'Réservation annulée'),
        ('booking_completed', 'Service terminé'),
        ('new_review', 'Nouveau commentaire'),
        ('new_message', 'Nouveau message'),
        ('new_service_request', 'Nouvelle demande de service'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        null=True, blank=True
    )
    related_service_request = models.ForeignKey(
        'ServiceRequest',
        on_delete=models.CASCADE,
        null=True, blank=True
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.type} - {self.user.username}"


class ServiceRequest(models.Model):
    STATUS_CHOICES = [('open', 'Ouverte'), ('awarded', 'Attribuée'), ('cancelled', 'Annulée')]
    client = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='service_requests')
    category = models.ForeignKey(ServiceCategory, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    service_area = models.CharField(max_length=100)
    preferred_dates = models.TextField(blank=True)
    submission_deadline = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    # Géolocalisation de la demande
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class ServiceRequestImage(models.Model):
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='service_requests/')
    created_at = models.DateTimeField(auto_now_add=True)


class Bid(models.Model):
    STATUS_CHOICES = [('pending', 'En attente'), ('accepted', 'Acceptée'), ('rejected', 'Refusée')]
    service_request = models.ForeignKey(ServiceRequest, on_delete=models.CASCADE, related_name='bids')
    provider = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='bids')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    price_unit = models.CharField(max_length=50, default='par projet')
    message = models.TextField()
    estimated_duration = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['service_request', 'provider']

    def __str__(self):
        return f"Bid by {self.provider} on {self.service_request}"


class PortfolioPhoto(models.Model):
    provider = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='portfolio_photos'
    )
    image   = models.ImageField(upload_to='portfolio/')
    caption = models.CharField(max_length=200, blank=True)
    order   = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"Portfolio de {self.provider.username} — #{self.id}"


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending',  'En attente'),
        ('completed', 'Complété'),
        ('failed',   'Échoué'),
        ('refunded', 'Remboursé'),
    ]

    bid      = models.OneToOneField(Bid, on_delete=models.CASCADE, related_name='payment')
    client   = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='payments_made')
    provider = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='payments_received')

    # Montants
    amount           = models.DecimalField(max_digits=10, decimal_places=2, help_text="Montant payé par le client ($)")
    commission_rate  = models.DecimalField(max_digits=5,  decimal_places=4, help_text="Taux de commission appliqué (ex: 0.15)")
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Commission Fuwoo ($)")
    provider_amount  = models.DecimalField(max_digits=10, decimal_places=2, help_text="Montant reversé au prestataire ($)")

    # Stripe
    stripe_session_id       = models.CharField(max_length=300, unique=True, blank=True)
    stripe_payment_intent_id = models.CharField(max_length=300, blank=True)

    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at   = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment #{self.id} — {self.amount}$ ({self.get_status_display()})"