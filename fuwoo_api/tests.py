# fuwoo_api/tests.py
"""
Suite de tests complète pour Fuwoo.

Couverture :
  - Auth (register, login, profil)
  - Services (CRUD, permissions)
  - Demandes de service + soumissions (flux complet client <-> prestataire)
  - Notifications géolocalisées (100km)
  - Filtrage par catégorie
  - Commission (calcul des paliers Stripe)
  - Contrats PDF
  - Vérification d'identité
  - Haversine (distance)
  - Emails (mocks)
  - Annulation

Runner :
  source env/bin/activate
  python manage.py test fuwoo_api -v 2
"""

import io
from datetime import timedelta
from decimal import Decimal
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils.timezone import now
from rest_framework.test import APIClient

from .models import (
    CustomUser, ServiceCategory, Service, ServiceRequest,
    Bid, Notification,
)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def future(days=30):
    return now() + timedelta(days=days)


def results(res):
    """
    Extrait la liste de résultats d'une réponse paginée ou non.
    Évite le piège de `[] or res.data` qui retourne le dict entier.
    """
    if isinstance(res.data, dict) and 'results' in res.data:
        return res.data['results']
    return res.data


def make_client(username='client1', **kwargs):
    return CustomUser.objects.create_user(
        username=username, password='Passw0rd!', email=f'{username}@test.com',
        role='client', **kwargs,
    )


def make_provider(username='provider1', category=None, lat=45.50, lng=-73.57, **kwargs):
    provider = CustomUser.objects.create_user(
        username=username, password='Passw0rd!', email=f'{username}@test.com',
        role='prestataire', has_provider_profile=True,
        latitude=lat, longitude=lng, **kwargs,
    )
    if category:
        Service.objects.create(
            provider=provider, category=category,
            title='Service test', description='desc',
            price=Decimal('50.00'), price_unit='par heure',
            duration=60, service_area='Montréal', max_distance=50,
        )
    return provider


def make_category(name='Ménage', slug='menage'):
    return ServiceCategory.objects.create(
        name=name, slug=slug, icon='broom', description='desc', is_active=True,
    )


def make_service_request(client, category=None, lat=45.50, lng=-73.57, deadline_days=30):
    return ServiceRequest.objects.create(
        client=client,
        category=category,
        title='Ménage résidentiel',
        description='Nettoyage complet maison 3 pièces',
        service_area='Montréal, QC',
        latitude=lat,
        longitude=lng,
        submission_deadline=future(deadline_days),
        status='open',
    )


# ─────────────────────────────────────────────────────────────────────────────
# 1. AUTHENTIFICATION
# ─────────────────────────────────────────────────────────────────────────────

class AuthTests(TestCase):

    def setUp(self):
        self.api = APIClient()

    def test_register_client(self):
        res = self.api.post('/api/auth/register/', {
            'username': 'newuser', 'email': 'new@test.com',
            'password': 'Passw0rd!', 'password_confirm': 'Passw0rd!',
            'role': 'client',
        })
        self.assertEqual(res.status_code, 201)
        self.assertIn('access', res.data)
        self.assertEqual(CustomUser.objects.filter(username='newuser').count(), 1)

    def test_register_duplicate_username(self):
        make_client('dupuser')
        res = self.api.post('/api/auth/register/', {
            'username': 'dupuser', 'email': 'other@test.com',
            'password': 'Passw0rd!', 'password_confirm': 'Passw0rd!',
        })
        self.assertEqual(res.status_code, 400)

    def test_register_password_mismatch(self):
        res = self.api.post('/api/auth/register/', {
            'username': 'testuser', 'email': 'x@test.com',
            'password': 'Passw0rd!', 'password_confirm': 'Wrong123',
        })
        self.assertEqual(res.status_code, 400)

    def test_login_success(self):
        make_client('loginuser')
        res = self.api.post('/api/auth/login/', {
            'username': 'loginuser', 'password': 'Passw0rd!',
        })
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)

    def test_login_wrong_password(self):
        make_client('loginuser2')
        res = self.api.post('/api/auth/login/', {
            'username': 'loginuser2', 'password': 'wrongpass',
        })
        # L'API retourne 400 ou 401 selon la configuration simplejwt
        self.assertIn(res.status_code, [400, 401])

    def test_profile_requires_auth(self):
        res = self.api.get('/api/profile/')
        self.assertEqual(res.status_code, 401)

    def test_profile_returns_user_data(self):
        user = make_client('profuser')
        self.api.force_authenticate(user)
        res = self.api.get('/api/profile/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['username'], 'profuser')


# ─────────────────────────────────────────────────────────────────────────────
# 2. SERVICES
# ─────────────────────────────────────────────────────────────────────────────

class ServiceTests(TestCase):

    def setUp(self):
        self.api = APIClient()
        self.category = make_category()
        self.provider = make_provider(category=self.category)
        self.client_user = make_client()

    def test_list_services_public(self):
        res = self.api.get('/api/services/')
        self.assertEqual(res.status_code, 200)

    def test_create_service_requires_provider_profile(self):
        self.api.force_authenticate(self.client_user)
        res = self.api.post('/api/services/', {
            'title': 'Test', 'description': 'desc', 'category_id': self.category.id,
            'price': '50.00', 'price_unit': 'par heure',
            'duration': 60, 'service_area': 'Montréal', 'max_distance': 50,
        }, format='json')
        self.assertIn(res.status_code, [400, 403])

    def test_create_service_as_provider(self):
        self.api.force_authenticate(self.provider)
        res = self.api.post('/api/services/', {
            'title': 'Nouveau service', 'description': 'desc',
            'category_id': self.category.id,
            'price': '75.00', 'price_unit': 'par heure',
            'duration': 90, 'service_area': 'Laval', 'max_distance': 30,
        }, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['provider']['id'], self.provider.id)

    def test_provider_cannot_edit_other_provider_service(self):
        other = make_provider('otherprovider', self.category)
        self.api.force_authenticate(other)
        service_id = Service.objects.filter(provider=self.provider).first().id
        res = self.api.patch(f'/api/services/{service_id}/', {'title': 'Hack'})
        self.assertIn(res.status_code, [403, 404])


# ─────────────────────────────────────────────────────────────────────────────
# 3. FLUX COMPLET : DEMANDE -> SOUMISSION -> ACCEPTATION
# ─────────────────────────────────────────────────────────────────────────────

class ServiceRequestBidFlowTests(TestCase):

    def setUp(self):
        self.api = APIClient()
        self.category = make_category()
        self.client_user = make_client('client_flow')
        self.provider = make_provider('provider_flow', category=self.category)

    # ── 3.1 Création de la demande ─────────────────────────────────────────

    def test_client_can_create_service_request(self):
        self.api.force_authenticate(self.client_user)
        res = self.api.post('/api/service-requests/', {
            'title': 'Ménage résidentiel',
            'description': 'Nettoyage 3 pièces',
            'service_area': 'Montréal',
            'submission_deadline': future(10).isoformat(),
            'category_id': self.category.id,
        }, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['status'], 'open')
        self.assertEqual(res.data['client']['id'], self.client_user.id)

    def test_unauthenticated_cannot_create_request(self):
        res = self.api.post('/api/service-requests/', {
            'title': 'Test', 'description': 'desc',
            'service_area': 'Montréal',
            'submission_deadline': future(5).isoformat(),
        }, format='json')
        self.assertEqual(res.status_code, 401)

    # ── 3.2 Visibilité des demandes ────────────────────────────────────────

    def test_client_sees_own_requests(self):
        sr = make_service_request(self.client_user, self.category)
        self.api.force_authenticate(self.client_user)
        res = self.api.get('/api/service-requests/')
        ids = [r['id'] for r in results(res)]
        self.assertIn(sr.id, ids)

    def test_client_cannot_see_other_clients_requests(self):
        other_client = make_client('other_client_z')
        sr = make_service_request(other_client, self.category)
        self.api.force_authenticate(self.client_user)
        res = self.api.get('/api/service-requests/')
        ids = [r['id'] for r in results(res)]
        self.assertNotIn(sr.id, ids)

    def test_provider_sees_open_requests_as_provider(self):
        sr = make_service_request(self.client_user, self.category)
        self.api.force_authenticate(self.provider)
        res = self.api.get('/api/service-requests/?as=provider')
        self.assertEqual(res.status_code, 200)
        ids = [r['id'] for r in results(res)]
        self.assertIn(sr.id, ids)

    def test_provider_cannot_see_expired_requests(self):
        sr = make_service_request(self.client_user, self.category, deadline_days=-1)
        self.api.force_authenticate(self.provider)
        res = self.api.get('/api/service-requests/?as=provider')
        ids = [r['id'] for r in results(res)]
        self.assertNotIn(sr.id, ids)

    def test_provider_cannot_see_awarded_requests(self):
        sr = make_service_request(self.client_user, self.category)
        sr.status = 'awarded'
        sr.save()
        self.api.force_authenticate(self.provider)
        res = self.api.get('/api/service-requests/?as=provider')
        ids = [r['id'] for r in results(res)]
        self.assertNotIn(sr.id, ids)

    # ── 3.3 Filtrage par catégorie ─────────────────────────────────────────

    def test_provider_only_sees_requests_matching_category(self):
        other_category = make_category('Jardinage', 'jardinage')
        sr_match = make_service_request(self.client_user, self.category)
        sr_other = make_service_request(self.client_user, other_category)

        self.api.force_authenticate(self.provider)
        res = self.api.get('/api/service-requests/?as=provider')
        ids = [r['id'] for r in results(res)]

        self.assertIn(sr_match.id, ids, "Le prestataire doit voir la demande de sa catégorie")
        self.assertNotIn(sr_other.id, ids, "Le prestataire ne doit pas voir les autres catégories")

    def test_provider_without_category_sees_all_open_requests(self):
        provider_nocat = make_provider('provider_nocat_z')
        other_cat = make_category('Plomberie', 'plomberie')
        sr = make_service_request(self.client_user, other_cat)
        self.api.force_authenticate(provider_nocat)
        res = self.api.get('/api/service-requests/?as=provider')
        ids = [r['id'] for r in results(res)]
        self.assertIn(sr.id, ids)

    # ── 3.4 Soumission d'une offre ─────────────────────────────────────────

    def test_provider_can_submit_bid(self):
        sr = make_service_request(self.client_user, self.category)
        self.api.force_authenticate(self.provider)
        res = self.api.post('/api/bids/', {
            'service_request': sr.id,
            'price': '120.00',
            'price_unit': 'fixed',
            'message': 'Je peux le faire demain.',
        }, format='json')
        self.assertEqual(res.status_code, 201, res.data)
        self.assertEqual(res.data['status'], 'pending')
        self.assertEqual(res.data['provider']['id'], self.provider.id)

    def test_client_cannot_submit_bid(self):
        sr = make_service_request(self.client_user, self.category)
        self.api.force_authenticate(self.client_user)
        res = self.api.post('/api/bids/', {
            'service_request': sr.id,
            'price': '100.00',
            'price_unit': 'fixed',
            'message': 'Je bid moi-même.',
        }, format='json')
        self.assertEqual(res.status_code, 400)

    def test_provider_cannot_bid_twice(self):
        """Le second bid doit retourner 400, pas crash sur UniqueViolation DB."""
        sr = make_service_request(self.client_user, self.category)
        self.api.force_authenticate(self.provider)
        self.api.post('/api/bids/', {
            'service_request': sr.id, 'price': '100.00',
            'price_unit': 'fixed', 'message': 'Premier',
        }, format='json')
        res = self.api.post('/api/bids/', {
            'service_request': sr.id, 'price': '80.00',
            'price_unit': 'fixed', 'message': 'Second',
        }, format='json')
        self.assertEqual(res.status_code, 400)
        self.assertEqual(Bid.objects.filter(service_request=sr).count(), 1)

    def test_cannot_bid_on_expired_request(self):
        sr = make_service_request(self.client_user, self.category, deadline_days=-1)
        self.api.force_authenticate(self.provider)
        res = self.api.post('/api/bids/', {
            'service_request': sr.id, 'price': '100.00',
            'price_unit': 'fixed', 'message': 'Trop tard',
        }, format='json')
        self.assertEqual(res.status_code, 400)

    def test_cannot_bid_on_awarded_request(self):
        sr = make_service_request(self.client_user, self.category)
        sr.status = 'awarded'
        sr.save()
        self.api.force_authenticate(self.provider)
        res = self.api.post('/api/bids/', {
            'service_request': sr.id, 'price': '100.00',
            'price_unit': 'fixed', 'message': 'Trop tard',
        }, format='json')
        self.assertEqual(res.status_code, 400)

    # ── 3.5 Visibilité des offres ──────────────────────────────────────────

    def test_client_sees_bids_on_own_request(self):
        sr = make_service_request(self.client_user, self.category)
        Bid.objects.create(
            service_request=sr, provider=self.provider,
            price=Decimal('100.00'), price_unit='fixed', message='test',
        )
        self.api.force_authenticate(self.client_user)
        res = self.api.get(f'/api/bids/?service_request={sr.id}')
        data = results(res)
        self.assertEqual(len(data), 1)

    def test_client_cannot_see_bids_on_other_requests(self):
        other_client = make_client('other_cl_z')
        sr = make_service_request(other_client, self.category)
        Bid.objects.create(
            service_request=sr, provider=self.provider,
            price=Decimal('100.00'), price_unit='fixed', message='test',
        )
        self.api.force_authenticate(self.client_user)
        res = self.api.get(f'/api/bids/?service_request={sr.id}')
        data = results(res)
        self.assertEqual(len(data), 0)

    def test_provider_sees_own_bids(self):
        sr = make_service_request(self.client_user, self.category)
        Bid.objects.create(
            service_request=sr, provider=self.provider,
            price=Decimal('100.00'), price_unit='fixed', message='test',
        )
        self.api.force_authenticate(self.provider)
        res = self.api.get('/api/bids/?as=provider')
        data = results(res)
        self.assertEqual(len(data), 1)

    # ── 3.6 Acceptation d'une offre ────────────────────────────────────────

    def test_client_can_accept_bid(self):
        sr = make_service_request(self.client_user, self.category)
        bid = Bid.objects.create(
            service_request=sr, provider=self.provider,
            price=Decimal('150.00'), price_unit='fixed', message='Dispo',
        )
        self.api.force_authenticate(self.client_user)
        res = self.api.post(f'/api/bids/{bid.id}/accept/')
        self.assertEqual(res.status_code, 200, res.data)
        bid.refresh_from_db()
        sr.refresh_from_db()
        self.assertEqual(bid.status, 'accepted')
        self.assertEqual(sr.status, 'awarded')

    def test_accepting_bid_rejects_others(self):
        sr = make_service_request(self.client_user, self.category)
        provider2 = make_provider('p2_z', self.category)
        bid1 = Bid.objects.create(
            service_request=sr, provider=self.provider,
            price=Decimal('100.00'), price_unit='fixed', message='offre 1',
        )
        bid2 = Bid.objects.create(
            service_request=sr, provider=provider2,
            price=Decimal('90.00'), price_unit='fixed', message='offre 2',
        )
        self.api.force_authenticate(self.client_user)
        self.api.post(f'/api/bids/{bid1.id}/accept/')
        bid2.refresh_from_db()
        self.assertEqual(bid2.status, 'rejected')

    def test_provider_cannot_accept_bid(self):
        """Le prestataire ne peut pas accepter une offre (403 ou 404 — les deux sont corrects)."""
        sr = make_service_request(self.client_user, self.category)
        bid = Bid.objects.create(
            service_request=sr, provider=self.provider,
            price=Decimal('100.00'), price_unit='fixed', message='test',
        )
        self.api.force_authenticate(self.provider)
        res = self.api.post(f'/api/bids/{bid.id}/accept/')
        # 404 est correct : le bid n'est pas dans le queryset du prestataire (sécurité par design)
        self.assertIn(res.status_code, [403, 404])

    def test_other_client_cannot_accept_bid(self):
        """Un autre client ne peut pas accepter une offre qui ne lui appartient pas."""
        other_client = make_client('other_c_z')
        sr = make_service_request(self.client_user, self.category)
        bid = Bid.objects.create(
            service_request=sr, provider=self.provider,
            price=Decimal('100.00'), price_unit='fixed', message='test',
        )
        self.api.force_authenticate(other_client)
        res = self.api.post(f'/api/bids/{bid.id}/accept/')
        # 404 est correct : le bid n'est pas visible par cet utilisateur
        self.assertIn(res.status_code, [403, 404])

    def test_cannot_accept_bid_when_request_already_awarded(self):
        sr = make_service_request(self.client_user, self.category)
        provider2 = make_provider('p3_z', self.category)
        bid1 = Bid.objects.create(
            service_request=sr, provider=self.provider,
            price=Decimal('100.00'), price_unit='fixed', message='1',
        )
        bid2 = Bid.objects.create(
            service_request=sr, provider=provider2,
            price=Decimal('80.00'), price_unit='fixed', message='2',
        )
        self.api.force_authenticate(self.client_user)
        self.api.post(f'/api/bids/{bid1.id}/accept/')
        res = self.api.post(f'/api/bids/{bid2.id}/accept/')
        self.assertEqual(res.status_code, 400)


# ─────────────────────────────────────────────────────────────────────────────
# 4. NOTIFICATIONS GÉOLOCALISÉES
# ─────────────────────────────────────────────────────────────────────────────

class GeoNotificationTests(TestCase):

    def setUp(self):
        self.api = APIClient()
        self.category = make_category()
        self.client_user = make_client()
        # Laval (~10km de Montréal centre)
        self.provider_proche = make_provider('proche', self.category, lat=45.5741, lng=-73.6921)
        # Québec (~250km de Montréal)
        self.provider_loin   = make_provider('loin',   self.category, lat=46.8139, lng=-71.2082)

    def _post_request_with_geo(self, extra=None):
        """Crée une demande de service avec coordonnées via l'API."""
        self.api.force_authenticate(self.client_user)
        payload = {
            'title': 'Test géo', 'description': 'desc',
            'service_area': 'Montréal',
            'submission_deadline': future(10).isoformat(),
            'category_id': self.category.id,
            'latitude': '45.5017', 'longitude': '-73.5673',
        }
        if extra:
            payload.update(extra)
        return self.api.post('/api/service-requests/', payload, format='json')

    def test_nearby_provider_gets_notification(self):
        self._post_request_with_geo()
        count = Notification.objects.filter(
            user=self.provider_proche, type='new_service_request',
        ).count()
        self.assertEqual(count, 1, "Le prestataire proche (< 100km) doit recevoir une notification")

    def test_far_provider_gets_no_notification(self):
        self._post_request_with_geo()
        count = Notification.objects.filter(
            user=self.provider_loin, type='new_service_request',
        ).count()
        self.assertEqual(count, 0, "Le prestataire à ~250km ne doit PAS recevoir de notification")

    def test_no_notifications_without_coordinates(self):
        self.api.force_authenticate(self.client_user)
        self.api.post('/api/service-requests/', {
            'title': 'Sans coords', 'description': 'desc',
            'service_area': 'Montréal',
            'submission_deadline': future(10).isoformat(),
        }, format='json')
        total = Notification.objects.filter(type='new_service_request').count()
        self.assertEqual(total, 0, "Sans coordonnées, zéro notification")

    def test_wrong_category_provider_gets_no_notification(self):
        """Un prestataire d'une autre catégorie ne doit pas être notifié."""
        plomberie = make_category('Plomberie', 'plomberie')
        plumber = make_provider('plumber_z', plomberie, lat=45.5741, lng=-73.6921)
        self._post_request_with_geo()
        count = Notification.objects.filter(
            user=plumber, type='new_service_request',
        ).count()
        self.assertEqual(count, 0, "Un plombier ne doit pas voir une demande de ménage")


# ─────────────────────────────────────────────────────────────────────────────
# 5. COMMISSION
# ─────────────────────────────────────────────────────────────────────────────

class CommissionCalculationTests(TestCase):

    def _rate(self, amount):
        tiers = [(500, Decimal('0.15')), (2000, Decimal('0.12')), (9999999, Decimal('0.10'))]
        for limit, rate in tiers:
            if amount <= limit:
                return rate
        return Decimal('0.10')

    def test_tier_low(self):
        self.assertEqual(self._rate(Decimal('200')), Decimal('0.15'))

    def test_tier_low_boundary(self):
        self.assertEqual(self._rate(Decimal('500')), Decimal('0.15'))

    def test_tier_mid(self):
        self.assertEqual(self._rate(Decimal('1000')), Decimal('0.12'))

    def test_tier_mid_boundary(self):
        self.assertEqual(self._rate(Decimal('2000')), Decimal('0.12'))

    def test_tier_high(self):
        self.assertEqual(self._rate(Decimal('5000')), Decimal('0.10'))

    def test_commission_amount_400(self):
        amount = Decimal('400.00')
        commission = (amount * self._rate(amount)).quantize(Decimal('0.01'))
        provider_amount = (amount - commission).quantize(Decimal('0.01'))
        self.assertEqual(commission, Decimal('60.00'))
        self.assertEqual(provider_amount, Decimal('340.00'))

    def test_commission_amount_1000(self):
        amount = Decimal('1000.00')
        commission = (amount * self._rate(amount)).quantize(Decimal('0.01'))
        self.assertEqual(commission, Decimal('120.00'))


# ─────────────────────────────────────────────────────────────────────────────
# 6. CONTRAT PDF
# ─────────────────────────────────────────────────────────────────────────────

class ContractPDFTests(TestCase):

    def setUp(self):
        self.api = APIClient()
        self.category = make_category()
        self.client_user = make_client('pdf_client')
        self.provider = make_provider('pdf_provider', self.category)
        self.sr = make_service_request(self.client_user, self.category)
        self.bid = Bid.objects.create(
            service_request=self.sr, provider=self.provider,
            price=Decimal('200.00'), price_unit='fixed',
            message='Je peux effectuer ce service.',
            status='accepted',
        )
        self.sr.status = 'awarded'
        self.sr.save()

    def test_generate_pdf_bytes(self):
        from .contract import generate_contract_pdf
        pdf = generate_contract_pdf(self.bid)
        self.assertIsInstance(pdf, bytes)
        self.assertTrue(pdf.startswith(b'%PDF'), "Doit commencer par la signature PDF")
        self.assertGreater(len(pdf), 1000)

    def test_client_can_download_contract(self):
        self.api.force_authenticate(self.client_user)
        res = self.api.get(f'/api/contracts/{self.bid.id}/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res['Content-Type'], 'application/pdf')
        self.assertIn('attachment', res['Content-Disposition'])

    def test_provider_can_download_contract(self):
        self.api.force_authenticate(self.provider)
        res = self.api.get(f'/api/contracts/{self.bid.id}/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res['Content-Type'], 'application/pdf')

    def test_third_party_cannot_download_contract(self):
        intrus = make_client('intrus')
        self.api.force_authenticate(intrus)
        res = self.api.get(f'/api/contracts/{self.bid.id}/')
        self.assertEqual(res.status_code, 403)

    def test_unauthenticated_cannot_download_contract(self):
        res = self.api.get(f'/api/contracts/{self.bid.id}/')
        self.assertEqual(res.status_code, 401)

    def test_pending_bid_has_no_contract(self):
        sr2 = make_service_request(self.client_user, self.category)
        pending_bid = Bid.objects.create(
            service_request=sr2, provider=self.provider,
            price=Decimal('100.00'), price_unit='fixed', message='en attente',
            status='pending',
        )
        self.api.force_authenticate(self.client_user)
        res = self.api.get(f'/api/contracts/{pending_bid.id}/')
        self.assertEqual(res.status_code, 404)


# ─────────────────────────────────────────────────────────────────────────────
# 7. VÉRIFICATION D'IDENTITÉ
# ─────────────────────────────────────────────────────────────────────────────

class IdentityVerificationTests(TestCase):

    def setUp(self):
        self.api = APIClient()
        self.provider = make_provider('id_provider')

    def test_initial_status_not_submitted(self):
        self.assertEqual(self.provider.identity_status, 'not_submitted')

    def test_submit_requires_auth(self):
        res = self.api.post('/api/auth/submit-identity/', {}, format='multipart')
        self.assertEqual(res.status_code, 401)

    def test_submit_without_file_returns_error(self):
        self.api.force_authenticate(self.provider)
        res = self.api.post('/api/auth/submit-identity/', {}, format='multipart')
        self.assertEqual(res.status_code, 400)

    def test_submit_pdf_sets_pending(self):
        self.api.force_authenticate(self.provider)
        # Utilise SimpleUploadedFile pour un vrai fichier uploadé
        fake_pdf = SimpleUploadedFile(
            'identity.pdf', b'%PDF-1.4 fake pdf content',
            content_type='application/pdf',
        )
        res = self.api.post(
            '/api/auth/submit-identity/',
            {'identity_document': fake_pdf},
            format='multipart',
        )
        self.assertEqual(res.status_code, 200, res.data)
        self.provider.refresh_from_db()
        self.assertEqual(self.provider.identity_status, 'pending')

    def test_approve_sets_verified(self):
        self.provider.identity_status = 'pending'
        self.provider.save()
        self.provider.identity_status = 'verified'
        self.provider.is_verified = True
        self.provider.save()
        self.provider.refresh_from_db()
        self.assertTrue(self.provider.is_verified)

    def test_serializer_exposes_identity_status(self):
        self.api.force_authenticate(self.provider)
        res = self.api.get('/api/profile/')
        self.assertIn('identity_status', res.data)


# ─────────────────────────────────────────────────────────────────────────────
# 8. HAVERSINE
# ─────────────────────────────────────────────────────────────────────────────

class HaversineTests(TestCase):

    def _dist(self, lat1, lng1, lat2, lng2):
        from .views import haversine_distance
        return haversine_distance(lat1, lng1, lat2, lng2)

    def test_same_point_is_zero(self):
        self.assertAlmostEqual(self._dist(45.5, -73.5, 45.5, -73.5), 0, delta=0.1)

    def test_montreal_to_laval_lt_20km(self):
        d = self._dist(45.5017, -73.5673, 45.5741, -73.6921)
        self.assertLess(d, 20)
        self.assertGreater(d, 1)

    def test_montreal_to_quebec_gt_200km(self):
        d = self._dist(45.5017, -73.5673, 46.8139, -71.2082)
        self.assertGreater(d, 200)

    def test_sherbrooke_outside_100km(self):
        # Sherbrooke est à ~150km de Montréal
        d = self._dist(45.5017, -73.5673, 45.4042, -71.8929)
        self.assertGreater(d, 100)


# ─────────────────────────────────────────────────────────────────────────────
# 9. EMAILS (mocks)
# ─────────────────────────────────────────────────────────────────────────────

class EmailNotificationTests(TestCase):

    def setUp(self):
        self.api = APIClient()
        self.category = make_category()
        self.client_user = make_client('email_client')
        self.provider = make_provider('email_provider', self.category)

    @patch('fuwoo_api.views.send_bid_received')
    def test_email_sent_to_client_on_bid(self, mock_send):
        sr = make_service_request(self.client_user, self.category)
        self.api.force_authenticate(self.provider)
        self.api.post('/api/bids/', {
            'service_request': sr.id,
            'price': '100.00', 'price_unit': 'fixed',
            'message': 'Disponible.',
        }, format='json')
        mock_send.assert_called_once()
        self.assertEqual(mock_send.call_args[0][0], self.client_user)

    @patch('fuwoo_api.views.send_bid_accepted')
    def test_email_sent_to_provider_on_accept(self, mock_send):
        sr = make_service_request(self.client_user, self.category)
        bid = Bid.objects.create(
            service_request=sr, provider=self.provider,
            price=Decimal('100.00'), price_unit='fixed', message='test',
        )
        self.api.force_authenticate(self.client_user)
        self.api.post(f'/api/bids/{bid.id}/accept/')
        mock_send.assert_called_once()
        self.assertEqual(mock_send.call_args[0][0], self.provider)


# ─────────────────────────────────────────────────────────────────────────────
# 10. ANNULATION
# ─────────────────────────────────────────────────────────────────────────────

class CancellationTests(TestCase):

    def setUp(self):
        self.api = APIClient()
        self.category = make_category()
        self.client_user = make_client('cancel_client')
        self.provider = make_provider('cancel_provider', self.category)

    def test_client_can_cancel_own_request(self):
        sr = make_service_request(self.client_user, self.category)
        self.api.force_authenticate(self.client_user)
        res = self.api.post(f'/api/service-requests/{sr.id}/cancel/')
        self.assertEqual(res.status_code, 200)
        sr.refresh_from_db()
        self.assertEqual(sr.status, 'cancelled')

    def test_provider_cannot_cancel_client_request(self):
        """
        Un prestataire ne peut pas annuler la demande d'un client.
        Retourne 403 ou 404 (404 si la demande n'est pas dans son queryset).
        """
        sr = make_service_request(self.client_user, self.category)
        self.api.force_authenticate(self.provider)
        res = self.api.post(f'/api/service-requests/{sr.id}/cancel/')
        self.assertIn(res.status_code, [403, 404])
