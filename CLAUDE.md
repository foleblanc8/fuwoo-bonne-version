# CLAUDE.md — Coupdemain

Marketplace de services à domicile au Québec. Clients publient des demandes, prestataires soumettent des offres, plateforme prend une commission et retient le paiement en escrow jusqu'à l'approbation des travaux.

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Backend | Django 5.2 + Django REST Framework |
| Auth | JWT via `rest_framework_simplejwt` |
| Base de données | PostgreSQL (`fuwoo_db`, user `bigfol` en local) |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Paiements | Stripe (escrow — pas encore Stripe Connect) |
| Emails | Resend (prod) / console (dev) |
| Tests E2E | Playwright (18 tests, tourne sur Vercel) |
| Déploiement | Railway (backend) + Vercel (frontend) |

---

## Structure du projet

```
/                          # Monorepo
├── backend/               # Django project (settings.py, urls.py, wsgi.py)
├── fuwoo_api/             # App Django principale
│   ├── models.py          # Tous les modèles
│   ├── views.py           # Toutes les vues DRF
│   ├── serializers.py     # Tous les serializers
│   ├── urls.py            # Routes /api/*
│   ├── migrations/        # Dernière : 0020_providercredential
│   ├── emails.py          # Fonctions d'envoi email
│   └── fixtures/          # categories.json
├── src/                   # React frontend
│   ├── pages/             # DashboardPage.tsx, Services.tsx, ProviderProfilePage.tsx…
│   ├── contexts/          # AuthContext, BookingContext, ServiceContext, ToastContext, NotificationContext
│   ├── components/        # Header, ServiceCard, Skeleton, Toast…
│   └── main.tsx           # Entry point + providers
├── tests/e2e/             # Tests Playwright
│   └── global-setup.ts    # Warmup auth avant les tests
├── playwright.config.ts   # Config Playwright
├── manage.py
├── requirements.txt
└── package.json
```

---

## Commandes de dev

```bash
# Backend (port 8000)
python manage.py runserver

# Frontend (port 5173)
npm run dev

# Migrations
python manage.py makemigrations
python manage.py migrate

# Charger les catégories
python manage.py loaddata categories

# Générer un scénario de test Stripe complet
python manage.py seed_test_payment
```

---

## Architecture API

- Toutes les routes sous `/api/` → `fuwoo_api/urls.py`
- Vite proxy : `/api` → `http://localhost:8000`
- `axios.defaults.baseURL = '/api/'` dans `src/main.tsx`

### Endpoints principaux

```
POST   /api/auth/login/                    JWT login
POST   /api/auth/register/                 Inscription
POST   /api/auth/token/refresh/            Refresh JWT
GET    /api/profile/                       Profil utilisateur connecté
GET    /api/profile/tier/                  Palier de commission du prestataire

GET    /api/categories/                    Catégories de services
GET    /api/services/                      Services (filtrables)
GET    /api/service-requests/              Demandes de service
POST   /api/bids/                          Soumettre une offre
POST   /api/bids/<id>/accept/              Accepter une offre

POST   /api/payments/create-checkout/      Créer session Stripe
POST   /api/payments/webhook/             Webhook Stripe
POST   /api/payments/submit-work/          Prestataire soumet les travaux
POST   /api/payments/release/              Client libère le paiement
POST   /api/payments/dispute/              Client signale un problème
POST   /api/payments/cancel-request/       Prestataire demande annulation

GET    /api/credentials/?provider=<id>     Certifications d'un prestataire
GET    /api/portfolio/?provider=<id>       Photos portfolio
GET    /api/reviews/?provider_id=<id>      Avis d'un prestataire
```

---

## Modèles clés

### CustomUser
- Rôles : `client` (défaut) ou `prestataire`
- `has_provider_profile` — tout user peut activer un profil pro
- `identity_status` — `not_submitted / pending / verified / rejected`
- `rating`, `total_reviews` — mis à jour à chaque nouvel avis

### ServiceRequest (demande client)
- Statuts : `open → awarded → completed / closed / cancelled`
- `availability_windows` (JSONField) — jusqu'à 3 plages de dispo
- `is_recurring` + `recurrence_frequency` — services récurrents
- `parent_request` (FK self) — lien vers la demande parente si récurrence

### Bid (offre prestataire)
- Statuts : `pending → accepted / rejected`
- `price_unit` : `fixed / hourly`
- Lié à un `Payment` via OneToOne

### Payment (escrow)
- Statuts : `pending → held → work_submitted → released`
- Cas spéciaux : `disputed`, `cancellation_requested`, `refunded`, `completed`
- Auto-release 48h après `work_submitted_at` (vérifié dans `BidViewSet.list()`)

### ProviderCredential
- Types : `rbq`, `ccq`, `cmeq`, `cmmtq`, `insurance`, `skill`, `diploma`, `other`
- Champs : `title`, `license_number`, `issued_by`, `issued_year`, `expires_at`, `is_verified`

---

## Commissions

```python
# settings.py
STRIPE_PROVIDER_TIERS = [
    {'min_projects': 50, 'min_rating': 4.7, 'name': 'elite',       'rate': 0.08},  # Élite 🏆
    {'min_projects': 21, 'min_rating': 0.0, 'name': 'expert',      'rate': 0.10},  # Expert 💪
    {'min_projects': 6,  'min_rating': 0.0, 'name': 'established', 'rate': 0.12},  # Établi ⭐
    {'min_projects': 0,  'min_rating': 0.0, 'name': 'starter',     'rate': 0.15},  # Débutant 🌱
]
STRIPE_RECURRING_COMMISSION = 0.08  # Toujours 8% pour les récurrences
```

---

## Frontend — Contexts (ordre dans main.tsx)

```
AuthProvider > ToastProvider > NotificationProvider > ServiceProvider > BookingProvider > App
```

| Context | Fichier | Rôle |
|---------|---------|------|
| AuthContext | `src/contexts/AuthContext.tsx` | user, token, login, logout, register |
| ToastContext | `src/contexts/ToastContext.tsx` | showToast(msg, type) — auto-remove 3.5s |
| NotificationContext | `src/contexts/NotificationContext.tsx` | polling 30s, markAsRead, markAllAsRead |
| ServiceContext | `src/contexts/ServiceContext.tsx` | services + catégories depuis l'API |
| BookingContext | `src/contexts/BookingContext.tsx` | réservations (dépend de AuthContext) |

---

## Pages principales

| Page | Route | Description |
|------|-------|-------------|
| `DashboardPage.tsx` | `/dashboard` | Tableau de bord client + prestataire (onglets) |
| `Services.tsx` | `/services` | Liste services + formulaire demande |
| `ProviderProfilePage.tsx` | `/provider/:id` | Profil public prestataire |
| `connexion.tsx` | `/connexion` | Login |
| `Inscription.tsx` | `/inscription` | Register |

---

## Tests E2E (Playwright)

- Fichiers dans `tests/e2e/`
- Config : `playwright.config.ts` — pointe vers `https://fuwoo-bonne-version.vercel.app`
- 18 tests couvrant : inscription, connexion, dashboard, paramètres, etc.
- `workers: 1` + timeout 90s (Railway cold start)
- `global-setup.ts` — warmup de l'auth avant les tests

```bash
npm run test:e2e              # Lancer les tests
npm run test:e2e:report       # Voir le rapport HTML
```

> Les tests frappent le vrai backend (pas de mock DB). Penser au cold start Railway.

---

## Déploiement

- **Vercel** — frontend React, déploiement auto sur push `main`
- **Railway** — backend Django via Dockerfile, `start.sh` au démarrage :
  1. `migrate`
  2. `loaddata categories`
  3. `collectstatic`
  4. `gunicorn` (2 workers, 4 threads)

### Variables d'env Railway (production)
```
SECRET_KEY=...
DEBUG=False
DATABASE_URL=postgresql://...
ALLOWED_HOSTS=...railway.app
CORS_ALLOWED_ORIGINS=https://fuwoo-bonne-version.vercel.app
FRONTEND_URL=https://fuwoo-bonne-version.vercel.app
RESEND_API_KEY=re_...          # emails transactionnels
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Variables d'env Vercel (frontend)
```
VITE_API_URL=https://...railway.app
VITE_GOOGLE_CLIENT_ID=...      # optionnel — bouton Google masqué si absent
```

---

## Ce qui n'est PAS encore fait

- **Emails transactionnels** — Resend bloqué en attente du domaine `coupdemain.ca`
- **Stripe Connect** — payouts automatiques aux prestataires (paiement manuel pour l'instant)
- **Google OAuth** — `VITE_GOOGLE_CLIENT_ID` non configuré (en attente du domaine)
- **App mobile** — Capacitor prévu (~2 jours depuis la base React)

---

## Conventions

- Français dans l'UI, anglais dans le code
- Toasts pour tous les retours utilisateur (`useToast()`)
- Skeleton loaders sur les listes longues
- Pas de mock DB dans les tests — les tests E2E (Playwright) frappent le vrai backend
