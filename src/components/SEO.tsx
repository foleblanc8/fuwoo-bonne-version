// src/components/SEO.tsx
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Coupdemain';
const SITE_URL  = 'https://coupdemain.ca';
const DEFAULT_DESC = 'Décrivez votre projet, recevez des soumissions de pros vérifiés de votre région. Gratuit pour les clients. Service au Québec et au Canada.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
}

export default function SEO({ title, description, image, url, noIndex }: SEOProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Soumissions gratuites de pros locaux`;
  const desc  = description ?? DEFAULT_DESC;
  const img   = image ?? DEFAULT_IMAGE;
  const canonical = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image"       content={img} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:locale"      content="fr_CA" />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image"       content={img} />
    </Helmet>
  );
}
