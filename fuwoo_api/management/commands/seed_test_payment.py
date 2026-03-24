# fuwoo_api/management/commands/seed_test_payment.py
"""
Crée un scénario de test complet pour le paiement Stripe :
  1. Un prestataire de test (test_provider / test1234)
  2. Une demande de service pour le client cible
  3. Une offre acceptée du prestataire → prête pour le paiement

Usage :
  python manage.py seed_test_payment --client <username>
  python manage.py seed_test_payment --client bigfol69 --amount 75
"""

from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from fuwoo_api.models import ServiceRequest, Bid, ServiceCategory

User = get_user_model()

PROVIDER_USERNAME = 'test_provider'
PROVIDER_PASSWORD = 'test1234'


class Command(BaseCommand):
    help = 'Seed une offre acceptée pour tester le paiement Stripe'

    def add_arguments(self, parser):
        parser.add_argument('--client',  required=True, help='Username du client')
        parser.add_argument('--amount',  type=float, default=50.00, help='Montant de l\'offre (défaut: 50$)')

    def handle(self, *args, **options):
        client_username = options['client']
        amount = options['amount']

        # 1. Récupérer le client
        try:
            client = User.objects.get(username=client_username)
        except User.DoesNotExist:
            raise CommandError(f"Utilisateur '{client_username}' introuvable.")

        # 2. Créer ou récupérer le prestataire de test
        provider, created = User.objects.get_or_create(
            username=PROVIDER_USERNAME,
            defaults={
                'first_name': 'Bot',
                'last_name':  'Testeur',
                'email':      'test_provider@coupdemain.test',
                'has_provider_profile': True,
                'role':       'prestataire',
                'bio':        'Compte de test automatisé.',
                'is_verified': True,
            }
        )
        if created:
            provider.set_password(PROVIDER_PASSWORD)
            provider.save()
            self.stdout.write(self.style.SUCCESS(
                f'✅ Prestataire de test créé : {PROVIDER_USERNAME} / {PROVIDER_PASSWORD}'
            ))
        else:
            self.stdout.write(f'ℹ️  Prestataire de test existant : {PROVIDER_USERNAME}')

        # 3. Récupérer une catégorie
        category = ServiceCategory.objects.filter(is_active=True).first()

        # 4. Créer la demande de service
        req = ServiceRequest.objects.create(
            client=client,
            title='[TEST] Peinture salon — test paiement Stripe',
            description='Demande créée automatiquement pour tester le paiement.',
            category=category,
            service_area='Montréal, QC',
            preferred_dates='Dès que possible',
            submission_deadline=timezone.now() + timedelta(days=7),
            status='open',
        )
        self.stdout.write(f'📋 Demande créée : #{req.id} — {req.title}')

        # 5. Créer l'offre du prestataire
        bid = Bid.objects.create(
            service_request=req,
            provider=provider,
            price=amount,
            price_unit='par projet',
            message=f'Offre de test automatique — {amount}$ CAD. Prêt à commencer rapidement.',
            status='pending',
        )

        # 6. Accepter l'offre (simule le client qui clique "Choisir ce pro")
        bid.status = 'accepted'
        bid.save()
        req.status = 'awarded'
        req.save()

        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 Scénario prêt !\n'
            f'   Demande #{req.id} — offre #{bid.id} — {amount}$ CAD\n'
            f'   → Connecte-toi en tant que {client_username} sur Vercel\n'
            f'   → Va dans Mes projets → "{req.title}"\n'
            f'   → Clique "Payer {amount}$"\n'
            f'   → Carte test : 4242 4242 4242 4242 | 12/29 | 123\n'
        ))
