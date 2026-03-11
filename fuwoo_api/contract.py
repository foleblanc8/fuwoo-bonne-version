# fuwoo_api/contract.py
"""
Génération de contrats PDF pour Fuwoo.
Utilise ReportLab pour créer un contrat numérique entre client et prestataire.
"""

import io
from datetime import date
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

# ─── Couleurs Fuwoo ──────────────────────────────────────────────────────────

INDIGO      = colors.HexColor('#4f46e5')
INDIGO_LIGHT = colors.HexColor('#ede9fe')
GREEN       = colors.HexColor('#059669')
RED         = colors.HexColor('#dc2626')
GRAY_900    = colors.HexColor('#111827')
GRAY_700    = colors.HexColor('#374151')
GRAY_500    = colors.HexColor('#6b7280')
GRAY_200    = colors.HexColor('#e5e7eb')
GRAY_50     = colors.HexColor('#f9fafb')
WHITE       = colors.white


def _styles():
    base = getSampleStyleSheet()
    return {
        'title': ParagraphStyle(
            'ContractTitle',
            fontName='Helvetica-Bold',
            fontSize=22,
            textColor=WHITE,
            alignment=TA_CENTER,
            spaceAfter=4,
        ),
        'subtitle': ParagraphStyle(
            'ContractSubtitle',
            fontName='Helvetica',
            fontSize=11,
            textColor=colors.HexColor('#c4b5fd'),
            alignment=TA_CENTER,
        ),
        'section_header': ParagraphStyle(
            'SectionHeader',
            fontName='Helvetica-Bold',
            fontSize=12,
            textColor=INDIGO,
            spaceBefore=14,
            spaceAfter=6,
        ),
        'label': ParagraphStyle(
            'Label',
            fontName='Helvetica-Bold',
            fontSize=9,
            textColor=GRAY_500,
            spaceAfter=1,
        ),
        'value': ParagraphStyle(
            'Value',
            fontName='Helvetica',
            fontSize=10,
            textColor=GRAY_900,
            spaceAfter=8,
        ),
        'body': ParagraphStyle(
            'Body',
            fontName='Helvetica',
            fontSize=9,
            textColor=GRAY_700,
            leading=14,
            spaceAfter=6,
        ),
        'footer': ParagraphStyle(
            'Footer',
            fontName='Helvetica',
            fontSize=8,
            textColor=GRAY_500,
            alignment=TA_CENTER,
        ),
        'amount': ParagraphStyle(
            'Amount',
            fontName='Helvetica-Bold',
            fontSize=16,
            textColor=INDIGO,
            alignment=TA_CENTER,
        ),
        'note': ParagraphStyle(
            'Note',
            fontName='Helvetica-Oblique',
            fontSize=8,
            textColor=GRAY_500,
            alignment=TA_CENTER,
        ),
    }


def _section(title):
    """Retourne un en-tête de section avec ligne de séparation."""
    s = _styles()
    return [
        Spacer(1, 6),
        Paragraph(title.upper(), s['section_header']),
        HRFlowable(width='100%', thickness=1, color=INDIGO_LIGHT, spaceAfter=6),
    ]


def _party_table(label, name, email, phone='', address=''):
    """Tableau d'info d'une partie (client ou prestataire)."""
    rows = [
        ['NOM COMPLET', name],
        ['COURRIEL', email],
    ]
    if phone:
        rows.append(['TÉLÉPHONE', phone])
    if address:
        rows.append(['ADRESSE', address])

    t = Table(rows, colWidths=[1.4 * inch, 4.6 * inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), GRAY_50),
        ('TEXTCOLOR', (0, 0), (0, -1), GRAY_500),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (0, -1), 8),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (1, 0), (1, -1), 10),
        ('TEXTCOLOR', (1, 0), (1, -1), GRAY_900),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('ROWBACKGROUND', (0, 0), (-1, -1), [WHITE, GRAY_50]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    return t


def generate_contract_pdf(bid) -> bytes:
    """
    Génère un contrat PDF pour une soumission acceptée.
    `bid` est une instance de Bid avec select_related('service_request', 'provider',
    'service_request__client').
    """
    sr      = bid.service_request
    client  = sr.client
    provider = bid.provider
    s = _styles()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.75 * inch,
    )

    story = []

    # ── En-tête coloré ───────────────────────────────────────────────────────
    header_data = [[
        Paragraph('FUWOO', s['title']),
    ]]
    subtitle_text = Paragraph('Contrat de service numérique', s['subtitle'])
    header_table = Table(
        [[Paragraph('FUWOO', s['title'])],
         [subtitle_text]],
        colWidths=[7 * inch],
    )
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), INDIGO),
        ('TOPPADDING', (0, 0), (-1, -1), 18),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 18),
        ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ('RIGHTPADDING', (0, 0), (-1, -1), 16),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # ── Méta-données du contrat ───────────────────────────────────────────────
    contract_no = f"FW-{bid.id:06d}"
    today = date.today().strftime('%d %B %Y')

    meta_data = [
        ['N° CONTRAT', contract_no, 'DATE', today],
        ['STATUT', 'Soumission acceptée', 'SECTEUR', sr.category.name if sr.category else '—'],
    ]
    meta_table = Table(meta_data, colWidths=[1.2*inch, 2.3*inch, 1.2*inch, 2.3*inch])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), GRAY_50),
        ('BACKGROUND', (2, 0), (2, -1), GRAY_50),
        ('TEXTCOLOR', (0, 0), (0, -1), GRAY_500),
        ('TEXTCOLOR', (2, 0), (2, -1), GRAY_500),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTNAME', (3, 0), (3, -1), 'Helvetica'),
        ('FONTSIZE', (1, 0), (1, -1), 9),
        ('FONTSIZE', (3, 0), (3, -1), 9),
        ('TEXTCOLOR', (1, 0), (1, -1), GRAY_900),
        ('TEXTCOLOR', (3, 0), (3, -1), GRAY_900),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)

    # ── Parties ───────────────────────────────────────────────────────────────
    story += _section('1. Parties au contrat')

    client_name = f"{client.first_name} {client.last_name}".strip() or client.username
    provider_name = f"{provider.first_name} {provider.last_name}".strip() or provider.username

    parties_label = Table(
        [['CLIENT (Donneur d\'ordre)', 'PRESTATAIRE (Fournisseur)']],
        colWidths=[3.5*inch, 3.5*inch],
    )
    parties_label.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, -1), INDIGO),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(parties_label)

    client_t = _party_table(
        'CLIENT', client_name, client.email,
        phone=getattr(client, 'phone_number', '') or '',
        address=getattr(client, 'address', '') or '',
    )
    provider_t = _party_table(
        'PRESTATAIRE', provider_name, provider.email,
        phone=getattr(provider, 'phone_number', '') or '',
        address=getattr(provider, 'address', '') or '',
    )

    parties_table = Table([[client_t, provider_t]], colWidths=[3.5*inch, 3.5*inch])
    parties_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('INNERGRID', (0, 0), (-1, -1), 0, WHITE),
        ('RIGHTPADDING', (0, 0), (0, -1), 8),
    ]))
    story.append(parties_table)

    # ── Description du service ────────────────────────────────────────────────
    story += _section('2. Description du service')

    service_rows = [
        ['SERVICE DEMANDÉ', sr.title],
        ['ZONE D\'INTERVENTION', sr.service_area or '—'],
    ]
    if sr.preferred_dates:
        service_rows.append(['DATE(S) SOUHAITÉE(S)', sr.preferred_dates])
    if sr.submission_deadline:
        service_rows.append(['DATE LIMITE DE SOUMISSION',
                              sr.submission_deadline.strftime('%d/%m/%Y')])
    if sr.description:
        service_rows.append(['DESCRIPTION', sr.description[:400]])
    if bid.message:
        service_rows.append(['PROPOSITION DU PRESTATAIRE', bid.message[:400]])
    if bid.estimated_duration:
        service_rows.append(['DURÉE ESTIMÉE', bid.estimated_duration])

    service_table = Table(service_rows, colWidths=[2*inch, 5*inch])
    service_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), GRAY_50),
        ('TEXTCOLOR', (0, 0), (0, -1), GRAY_500),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (0, -1), 8),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (1, 0), (1, -1), 9),
        ('TEXTCOLOR', (1, 0), (1, -1), GRAY_900),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('ROWBACKGROUND', (0, 0), (-1, -1), [WHITE, GRAY_50]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(service_table)

    # ── Conditions financières ────────────────────────────────────────────────
    story += _section('3. Conditions financières')

    price_unit_labels = {
        'fixed': 'Forfait',
        'hourly': '$/heure',
        'daily': '$/jour',
        'sqft': '$/pi²',
    }
    price_unit_label = price_unit_labels.get(bid.price_unit, bid.price_unit)

    amount_table = Table(
        [[Paragraph(f'{bid.price} $ {price_unit_label}', s['amount'])]],
        colWidths=[7*inch],
    )
    amount_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), INDIGO_LIGHT),
        ('TOPPADDING', (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    story.append(amount_table)
    story.append(Spacer(1, 8))

    fin_rows = [
        ['MONTANT DE LA SOUMISSION', f'{bid.price} $'],
        ['FRAIS DE PLATEFORME FUWOO', 'Selon barème : 10 % – 15 %'],
        ['MONTANT NET AU PRESTATAIRE', 'Versé après confirmation du service'],
        ['MODALITÉ DE PAIEMENT', 'Paiement sécurisé via Stripe'],
    ]
    fin_table = Table(fin_rows, colWidths=[3*inch, 4*inch])
    fin_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), GRAY_50),
        ('TEXTCOLOR', (0, 0), (0, -1), GRAY_500),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (0, -1), 8),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (1, 0), (1, -1), 9),
        ('TEXTCOLOR', (1, 0), (1, -1), GRAY_900),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY_200),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(fin_table)

    # ── Obligations et conditions ─────────────────────────────────────────────
    story += _section('4. Obligations des parties')

    clauses = [
        ('Le prestataire s\'engage à :', [
            'Réaliser le service conformément à la description convenue, avec soin et professionnalisme.',
            'Se présenter à la date et à l\'heure convenues, ou prévenir le client au moins 24 heures à l\'avance.',
            'Respecter les normes sanitaires et de sécurité applicables.',
            'Ne pas sous-traiter le travail sans accord préalable du client.',
        ]),
        ('Le client s\'engage à :', [
            'Fournir l\'accès aux lieux et les informations nécessaires à l\'exécution du service.',
            'Effectuer le paiement via la plateforme Fuwoo dans les délais convenus.',
            'Signaler tout problème ou insatisfaction dans un délai de 48 heures suivant le service.',
        ]),
    ]

    for title, items in clauses:
        story.append(Paragraph(title, ParagraphStyle(
            'ClauseTitle', fontName='Helvetica-Bold', fontSize=9,
            textColor=GRAY_700, spaceAfter=3,
        )))
        for item in items:
            story.append(Paragraph(
                f'• {item}',
                ParagraphStyle('Clause', fontName='Helvetica', fontSize=9,
                               textColor=GRAY_700, leading=13, leftIndent=12, spaceAfter=2),
            ))
        story.append(Spacer(1, 6))

    # ── Résolution des différends ─────────────────────────────────────────────
    story += _section('5. Résolution des différends')
    story.append(Paragraph(
        'En cas de différend entre les parties, celles-ci s\'engagent à contacter en premier lieu '
        'le service de médiation de Fuwoo (support@fuwoo.ca) afin de tenter une résolution amiable '
        'dans un délai de 10 jours ouvrables. À défaut d\'accord, le litige sera soumis aux '
        'tribunaux compétents de la province de Québec, Canada.',
        s['body'],
    ))

    # ── Signatures ────────────────────────────────────────────────────────────
    story += _section('6. Signatures')
    story.append(Paragraph(
        'En acceptant cette soumission via la plateforme Fuwoo, les deux parties reconnaissent '
        'avoir lu, compris et accepté les termes du présent contrat.',
        s['body'],
    ))
    story.append(Spacer(1, 16))

    sig_rows = [[
        f'CLIENT\n\n\n_______________________\n{client_name}\nDate : {today}',
        f'PRESTATAIRE\n\n\n_______________________\n{provider_name}\nDate : {today}',
        'FUWOO (Plateforme)\n\n\n_______________________\nFuwoo Inc.\nDate : ' + today,
    ]]
    sig_table = Table(sig_rows, colWidths=[2.33*inch, 2.33*inch, 2.33*inch])
    sig_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (-1, -1), GRAY_700),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('LINEABOVE', (0, 0), (-1, 0), 0.5, GRAY_200),
    ]))
    story.append(sig_table)

    # ── Pied de page ─────────────────────────────────────────────────────────
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width='100%', thickness=0.5, color=GRAY_200))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        f'Contrat N° {contract_no} — Généré automatiquement par Fuwoo le {today} — '
        'Ce document constitue un accord légalement contraignant entre les parties. — '
        'fuwoo.ca | support@fuwoo.ca',
        s['footer'],
    ))

    doc.build(story)
    return buffer.getvalue()
