# Fuwoo — Marketplace de services à domicile (Québec)

## Vision du projet
Fuwoo est une plateforme de mise en relation entre clients et prestataires de services à domicile au Québec (rénovation, entretien, travaux, etc.). Les clients publient des demandes de service, les prestataires soumettent des offres (bids), et la plateforme gère les paiements via escrow Stripe.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| Backend | Django 5.2 + Django REST Framework + JWT |
| Base de données | PostgreSQL |
| Paiements | Stripe (escrow) |
| Auth | JWT (SimpleJWT) + Google OAuth optionnel |
| Tests E2E | Playwright (18 tests, tourne sur Vercel) |
| Déploiement frontend | Vercel → https://fuwoo-bonne-version.vercel.app |
| Déploiement backend | Railway (Docker) |

---

## Structure du projet

```
fuwoo-bonne-version/
├── src/                    # Frontend React
│   ├── pages/              # Pages: Home, Dashboard, Services, Profil, etc.
│   ├── components/         # Header, Footer, Layout, ServiceCard, Toast, etc.
│   ├── contexts/           # Contextes React (auth, etc.)
│   └── data/               # Données statiques
├── fuwoo_api/              # App Django principale
│   ├── models.py           # Tous les modèles (voir section Models)
│   ├── views.py            # API endpoints
│   ├── serializers.py      # DRF serializers
│   ├── urls.py             # Routes API
│   ├── permissions.py      # Permissions custom
│   ├── contract.py         # Génération de contrats PDF (reportlab)
│   └── emails.py           # Envoi d'emails
├── backend/                # Config Django (settings, urls, wsgi)
├── tests/e2e/              # Tests Playwright
├── start.sh                # Script démarrage Railway (migrate → fixtures → collectstatic → gunicorn)
├── Dockerfile              # Build Railway
└── vercel.json             # SPA rewrite pour Vercel
```

---

## Modèles Django (fuwoo_api/models.py)

- **CustomUser** — utilisateur avec rôle `client` ou `prestataire`, vérification email, identité (RBQ etc.), acceptation CGU + clause CNESST, géolocalisation
- **ServiceCategory** — catégories de services (avec fixtures au démarrage)
- **Service** — service offert par un prestataire (prix, durée, zone, disponibilité)
- **ServiceImage** — photos d'un service
- **Availability** — plages de disponibilité structurées (jour + heure début/fin)
- **Booking** — réservation client ↔ prestataire, statuts: pending → confirmed → in_progress → completed / cancelled
- **Review** — évaluation après booking ou bid (note globale + qualité, ponctualité, communication)
- **Message** — messagerie entre client et prestataire (liée à un booking)
- **Notification** — notifications in-app (bell dropdown)
- **ServiceRequest** — demande de service publiée par un client (avec récurrence possible)
- **ServiceRequestImage** — photos jointes à une demande
- **Bid** — offre d'un prestataire sur une demande, statuts: pending → accepted / rejected
- **PortfolioPhoto** — photos portfolio du prestataire
- **ProviderCredential** — licences/certifications (RBQ, CCQ, CMEQ, CMMTQ, assurance, compétences)
- **CRMClient** — CRM personnel du prestataire (pipeline: lead → contacté → soumission → actif → récurrent)

---

## Flux de paiement (Escrow Stripe)

1. Client paie → argent mis en escrow (Stripe)
2. Prestataire soumet la complétion du travail
3. Client accepte → fonds libérés vers prestataire (moins commission Fuwoo **8%**)
4. Si litige → admin peut annuler / rembourser

Commission Fuwoo : **8%** (structure en tiers possible, à confirmer)

---

## Légal / Conformité (Québec)

- **CGU** : `terms_accepted_at` stocké en base à l'inscription
- **CNESST** : `cnesst_accepted_at` — clause travailleur autonome acceptée à l'onboarding prestataire
- **Âge minimum** : 14 ans
- **Vérification d'identité** : documents uploadés, statuts `not_submitted / pending / verified / rejected`
- **Licences RBQ** : affichées sur profil prestataire, vérifiées par admin

---

## Commandes utiles

### Frontend
```bash
npm run dev          # Démarrer Vite en local
npm run build        # Build de production
npm run test:e2e     # Lancer les tests Playwright (pointe vers Vercel par défaut)
```

### Backend (Django)
```bash
python manage.py runserver          # Démarrer le serveur Django
python manage.py migrate            # Appliquer les migrations
python manage.py makemigrations     # Créer de nouvelles migrations
python manage.py loaddata categories  # Charger les fixtures de catégories
python manage.py createsuperuser    # Créer un admin
python manage.py seed_test_payment  # Générer un scénario de test Stripe complet
```

### Déploiement
- **Frontend** : push sur `main` → Vercel déploie automatiquement
- **Backend** : push sur `main` → Railway rebuild via Dockerfile
- `start.sh` tourne au démarrage Railway : migrate → loaddata → collectstatic → gunicorn

---

## Variables d'environnement importantes

### Backend (Railway)
- `SECRET_KEY` — clé Django
- `DATABASE_URL` — PostgreSQL (dj-database-url)
- `ALLOWED_HOSTS` — hosts autorisés
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET`
- `DEBUG` — `True` en local, `False` en prod

### Frontend (Vercel)
- `VITE_API_URL` — URL de l'API Railway
- `VITE_GOOGLE_CLIENT_ID` — Google OAuth (optionnel, désactivé si absent)

---

## Tests E2E (Playwright)

- Fichiers dans `tests/e2e/`
- Config : `playwright.config.ts` — pointe vers `https://fuwoo-bonne-version.vercel.app`
- 18 tests couvrant : inscription, connexion, dashboard, paramètres, etc.
- `workers: 1` (Railway cold start) + timeout 90s
- `global-setup.ts` — warmup de l'auth avant les tests

---

## Conventions de code

- **Frontend** : composants en PascalCase, pages dans `src/pages/`, hooks dans `src/contexts/`
- **Backend** : vues dans `views.py`, serializers dans `serializers.py`, tout dans l'app `fuwoo_api`
- **Langue** : UI en français (Québec), code et commentaires en français
- **Commits** : format `feat: ...` / `fix: ...` / `refactor: ...` en français

---

## Ce qui a été fait (historique récent)

- [x] Compétences/certifications prestataires (ProviderCredential)
- [x] Rate limiting sur les endpoints sensibles
- [x] Tiers de commission (structure en place)
- [x] Récurrence de services (hebdo, bihebdo, mensuel, saisonnier)
- [x] Commission 8% Fuwoo
- [x] Disponibilités structurées (plages horaires)
- [x] Escrow simplifié Stripe (soumission → acceptation → libération)
- [x] Notifications bell dropdown
- [x] Badges statut paiement
- [x] seed_test_payment command
- [x] Traçabilité légale (terms_accepted_at, cnesst_accepted_at)
- [x] Onboarding prestataire 4 étapes
- [x] Onglet Sécurité dashboard
- [x] Vérification d'identité (upload document)
- [x] Suite E2E Playwright (18 tests sur Vercel)
- [x] Microsoft Clarity (tracking comportement)
- [x] CRM prestataire (pipeline clients)
- [x] Portfolio photos prestataire
- [x] Génération contrats PDF (reportlab)

---

## Ce qui reste à faire / Prochaines priorités

<!-- À COMPLÉTER avec le propriétaire du projet -->
- [ ] ...

---

## Notes importantes

- Le `memory.md` mentionné par le développeur contient peut-être du contexte supplémentaire — vérifier s'il existe localement
- L'app s'appelait "coupdemain" dans `package.json` (nom interne), le nom public est **Fuwoo**
- Google OAuth est optionnel — si `VITE_GOOGLE_CLIENT_ID` absent, le bouton Google est masqué
- Les fixtures de catégories sont chargées automatiquement au démarrage Railway via `start.sh`
