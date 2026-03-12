# fuwoo_api/emails.py
"""
Utilitaires d'envoi d'emails HTML pour Fuwoo.
Tous les emails utilisent une base commune (header + footer branded).
"""

from django.core.mail import EmailMultiAlternatives
from django.conf import settings


# ─── Base HTML ────────────────────────────────────────────────────────────────

def _base(title: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#14532d 0%,#15803d 50%,#0e7490 100%);padding:28px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">🌿 Fuwoo</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,.7);font-size:13px;">La plateforme de services au Québec</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            {body_html}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
              © 2026 Fuwoo — Tous droits réservés<br/>
              <a href="{settings.FRONTEND_URL}" style="color:#15803d;text-decoration:none;">fuwoo.ca</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _btn(url: str, label: str) -> str:
    return f"""
<p style="text-align:center;margin:28px 0 0;">
  <a href="{url}" style="display:inline-block;background:linear-gradient(135deg,#15803d,#0e7490);color:#ffffff;text-decoration:none;
     padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:-0.2px;">
    {label}
  </a>
</p>
<p style="text-align:center;margin:12px 0 0;font-size:12px;color:#9ca3af;">
  Ou copiez ce lien : <a href="{url}" style="color:#15803d;">{url}</a>
</p>"""


def _greeting(name: str) -> str:
    return f'<p style="margin:0 0 20px;color:#374151;font-size:16px;">Bonjour <strong>{name}</strong>,</p>'


def _send(subject: str, to: str, html: str, text: str):
    """Envoie un email HTML + texte brut en fallback."""
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to],
    )
    msg.attach_alternative(html, 'text/html')
    try:
        msg.send()
    except Exception:
        pass  # Ne jamais faire planter une vue à cause d'un email


# ─── Templates ────────────────────────────────────────────────────────────────

def send_email_verification(user, verify_url: str):
    name = user.first_name or user.username
    body = f"""
{_greeting(name)}
<p style="color:#374151;line-height:1.6;margin:0 0 8px;">
  Merci de vous être inscrit sur Fuwoo ! Pour activer votre compte, veuillez vérifier votre adresse courriel.
</p>
{_btn(verify_url, 'Vérifier mon adresse courriel')}
<p style="color:#9ca3af;font-size:13px;margin:24px 0 0;text-align:center;">Ce lien est valide 24 heures.</p>"""
    html = _base('Vérifiez votre adresse courriel', body)
    text = f"Bonjour {name},\n\nVérifiez votre adresse courriel :\n{verify_url}"
    _send('Vérifiez votre adresse courriel — Fuwoo', user.email, html, text)


def send_password_reset(user, reset_url: str):
    name = user.first_name or user.username
    body = f"""
{_greeting(name)}
<p style="color:#374151;line-height:1.6;margin:0 0 8px;">
  Vous avez demandé une réinitialisation de mot de passe. Cliquez ci-dessous pour en créer un nouveau.
</p>
{_btn(reset_url, 'Réinitialiser mon mot de passe')}
<p style="color:#9ca3af;font-size:13px;margin:24px 0 0;text-align:center;">
  Ce lien expire dans 24 heures. Si vous n'avez pas fait cette demande, ignorez cet email.
</p>"""
    html = _base('Réinitialisation de mot de passe', body)
    text = f"Réinitialisez votre mot de passe :\n{reset_url}"
    _send('Réinitialisation de mot de passe — Fuwoo', user.email, html, text)


def send_welcome(user):
    name = user.first_name or user.username
    dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
    body = f"""
{_greeting(name)}
<p style="color:#374151;line-height:1.6;margin:0 0 16px;">
  Bienvenue sur <strong>Fuwoo</strong> ! Votre compte a été créé avec succès.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;padding:16px;margin-bottom:20px;">
  <tr>
    <td style="padding:6px 0;color:#6b7280;font-size:14px;">
      ✅&nbsp; Explorez les services disponibles près de chez vous<br/>
      📋&nbsp; Créez des demandes de service et recevez des soumissions<br/>
      🏆&nbsp; Évaluez les prestataires après chaque service
    </td>
  </tr>
</table>
{_btn(dashboard_url, 'Accéder à mon tableau de bord')}"""
    html = _base('Bienvenue sur Fuwoo !', body)
    text = f"Bienvenue {name} sur Fuwoo ! Accédez à votre tableau de bord : {dashboard_url}"
    _send('Bienvenue sur Fuwoo !', user.email, html, text)


def send_bid_received(client, service_request_title: str, provider_name: str, price: str, price_unit: str):
    name = client.first_name or client.username
    dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
    body = f"""
{_greeting(name)}
<p style="color:#374151;line-height:1.6;margin:0 0 16px;">
  Vous avez reçu une nouvelle offre pour votre demande <strong>« {service_request_title} »</strong>.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;padding:20px;margin-bottom:20px;">
  <tr>
    <td style="font-size:14px;color:#374151;line-height:1.8;">
      <strong>Prestataire :</strong> {provider_name}<br/>
      <strong>Offre :</strong> <span style="color:#15803d;font-weight:700;">{price} $ {price_unit}</span>
    </td>
  </tr>
</table>
<p style="color:#374151;line-height:1.6;margin:0 0 4px;">
  Consultez l'offre complète dans votre tableau de bord et acceptez celle qui vous convient le mieux.
</p>
{_btn(dashboard_url, 'Voir les offres reçues')}"""
    html = _base('Nouvelle offre reçue', body)
    text = f"Vous avez reçu une offre de {provider_name} pour « {service_request_title} » : {price} $ {price_unit}"
    _send(f'Nouvelle offre de {provider_name} — Fuwoo', client.email, html, text)


def send_bid_accepted(provider, service_request_title: str, client_name: str, price: str, price_unit: str):
    name = provider.first_name or provider.username
    dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
    body = f"""
{_greeting(name)}
<p style="color:#374151;line-height:1.6;margin:0 0 16px;">
  Excellente nouvelle ! Votre offre pour <strong>« {service_request_title} »</strong> a été <strong style="color:#059669;">acceptée</strong>.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border:1px solid #d1fae5;border-radius:10px;padding:20px;margin-bottom:20px;">
  <tr>
    <td style="font-size:14px;color:#374151;line-height:1.8;">
      <strong>Client :</strong> {client_name}<br/>
      <strong>Votre offre :</strong> <span style="color:#059669;font-weight:700;">{price} $ {price_unit}</span>
    </td>
  </tr>
</table>
<p style="color:#374151;line-height:1.6;margin:0 0 4px;">
  Le client va procéder au paiement. Vous serez notifié dès que le paiement sera confirmé.
</p>
{_btn(dashboard_url, 'Voir dans mon tableau de bord')}"""
    html = _base('Votre offre a été acceptée !', body)
    text = f"Votre offre pour « {service_request_title} » a été acceptée par {client_name}."
    _send('Votre offre a été acceptée — Fuwoo', provider.email, html, text)


def send_booking_confirmed(client, service_title: str, provider_name: str, date: str, address: str):
    name = client.first_name or client.username
    dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
    body = f"""
{_greeting(name)}
<p style="color:#374151;line-height:1.6;margin:0 0 16px;">
  Votre réservation pour <strong>« {service_title} »</strong> a été <strong style="color:#2563eb;">confirmée</strong>.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #dbeafe;border-radius:10px;padding:20px;margin-bottom:20px;">
  <tr>
    <td style="font-size:14px;color:#374151;line-height:1.8;">
      <strong>Prestataire :</strong> {provider_name}<br/>
      <strong>Date :</strong> {date}<br/>
      <strong>Adresse :</strong> {address}
    </td>
  </tr>
</table>
{_btn(dashboard_url, 'Voir ma réservation')}"""
    html = _base('Réservation confirmée', body)
    text = f"Votre réservation pour « {service_title} » avec {provider_name} le {date} est confirmée."
    _send('Réservation confirmée — Fuwoo', client.email, html, text)


def send_identity_verified(user):
    name = user.first_name or user.username
    profile_url = f"{settings.FRONTEND_URL}/provider/{user.id}"
    body = f"""
{_greeting(name)}
<p style="color:#374151;line-height:1.6;margin:0 0 16px;">
  Bonne nouvelle ! Votre identité a été <strong style="color:#059669;">vérifiée avec succès</strong>.
  Le badge <strong>✓ Vérifié</strong> est maintenant visible sur votre profil public.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border:1px solid #d1fae5;border-radius:10px;padding:20px;margin-bottom:20px;">
  <tr>
    <td style="font-size:14px;color:#059669;text-align:center;font-weight:700;font-size:18px;">
      ✓ Identité vérifiée
    </td>
  </tr>
</table>
<p style="color:#374151;line-height:1.6;margin:0 0 4px;">
  Les clients peuvent maintenant voir que vous êtes un prestataire de confiance.
</p>
{_btn(profile_url, 'Voir mon profil public')}"""
    html = _base('Identité vérifiée ✓', body)
    text = f"Votre identité a été vérifiée. Le badge Vérifié est visible sur votre profil."
    _send('Votre identité a été vérifiée — Fuwoo', user.email, html, text)


def send_identity_rejected(user, reason: str):
    name = user.first_name or user.username
    dashboard_url = f"{settings.FRONTEND_URL}/dashboard"
    body = f"""
{_greeting(name)}
<p style="color:#374151;line-height:1.6;margin:0 0 16px;">
  Nous n'avons pas pu vérifier votre identité avec le document soumis.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:20px;margin-bottom:20px;">
  <tr>
    <td style="font-size:14px;color:#991b1b;line-height:1.6;">
      <strong>Motif :</strong> {reason or "Document non conforme."}
    </td>
  </tr>
</table>
<p style="color:#374151;line-height:1.6;margin:0 0 4px;">
  Veuillez soumettre un nouveau document d'identité (passeport, permis de conduire ou carte d'identité nationale).
</p>
{_btn(dashboard_url, 'Soumettre un nouveau document')}"""
    html = _base('Vérification d\'identité — Action requise', body)
    text = f"Votre document d'identité a été rejeté. Motif : {reason}. Veuillez en soumettre un nouveau."
    _send('Vérification d\'identité — Action requise — Fuwoo', user.email, html, text)
