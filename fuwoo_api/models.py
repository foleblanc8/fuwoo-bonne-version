# fuwoo_api/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('client', 'Client'),
        ('prestataire', 'Prestataire'),
    )
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='client',  # Par défaut, tout nouvel utilisateur est client
    )

    # Tu peux ajouter d'autres champs personnalisés ici si nécessaire
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
