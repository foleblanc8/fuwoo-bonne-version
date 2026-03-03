// src/data/serviceImages.ts
// Images Unsplash par catégorie de service — stables et haute qualité

const BASE = 'https://images.unsplash.com';

export const categoryImageMap: Record<string, string> = {
  'menage-residentiel':   `${BASE}/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80`,
  'nettoyage-profondeur': `${BASE}/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&w=800&q=80`,
  'tonte-pelouse':        `${BASE}/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80`,
  'entretien-jardin':     `${BASE}/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80`,
  'deneigement':          `${BASE}/photo-1547486573-082e45e6e6de?auto=format&fit=crop&w=800&q=80`,
  'peinture':             `${BASE}/photo-1562259929-b4e1fd3aef09?auto=format&fit=crop&w=800&q=80`,
  'plomberie':            `${BASE}/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80`,
  'electricite':          `${BASE}/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80`,
  'demenagement':         `${BASE}/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80`,
  'lavage-vitres':        `${BASE}/photo-1527515862127-a4fc05baf7a5?auto=format&fit=crop&w=800&q=80`,
  'nettoyage-terrain':    `${BASE}/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=800&q=80`,
  'entretien-piscine':    `${BASE}/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&w=800&q=80`,
  'taille-haies':         `${BASE}/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80`,
  'elagage-arbres':       `${BASE}/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80`,
  'nettoyage-gouttieres': `${BASE}/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80`,
  'nettoyage-terrasse':   `${BASE}/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80`,
  'amenagement-paysager': `${BASE}/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=800&q=80`,
  'extermination':        `${BASE}/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80`,
};

// Fallback par seed picsum (stable, haute qualité, aucun risque d'erreur 404)
export function getCategoryImage(slug?: string): string {
  if (slug && categoryImageMap[slug]) return categoryImageMap[slug];
  const seed = slug ?? 'service-maison';
  return `https://picsum.photos/seed/${seed}/800/500`;
}
