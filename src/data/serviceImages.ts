// src/data/serviceImages.ts
// Images Unsplash par catégorie — stables et haute qualité

const BASE = 'https://images.unsplash.com';

export const categoryImageMap: Record<string, string> = {
  // Intérieur
  'menage-residentiel':   `${BASE}/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80`, // aspirateur/nettoyage
  'nettoyage-profondeur': `${BASE}/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80`, // boîtes carton déménagement
  'plomberie':            `${BASE}/photo-1676210134188-4c05dd172f89?auto=format&fit=crop&w=800&q=80`, // homme travaillant sur un tuyau dans un mur
  'electricite':          `${BASE}/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=800&q=80`,   // panneau électrique
  'peinture':             `${BASE}/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80`, // pot de peinture + pinceau
  'demenagement':         `${BASE}/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80`, // boîtes carton

  // Extérieur / paysager
  'tonte-pelouse':        `${BASE}/photo-1590820292118-e256c3ac2676?auto=format&fit=crop&w=800&q=80`, // tondeuse jaune et noire sur gazon vert
  'deneigement':          `${BASE}/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=800&q=80`, // pelle dans la neige
  'nettoyage-terrain':    `${BASE}/photo-1508933620399-369d39e5a79c?auto=format&fit=crop&w=800&q=80`, // ramassage feuilles automne
  'entretien-jardin':     `${BASE}/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80`, // jardin fleuri
  'taille-haies':         `${BASE}/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80`, // haies/arbustes
  'elagage-arbres':       `${BASE}/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80`, // grand arbre
  'amenagement-paysager': `${BASE}/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=800&q=80`,   // aménagement paysager
  'entretien-piscine':    `${BASE}/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&w=800&q=80`, // piscine bleue
  'nettoyage-gouttieres': `${BASE}/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80`, // gouttières/toiture
  'nettoyage-terrasse':   `${BASE}/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80`, // beau patio propre
  'lavage-vitres':        `${BASE}/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80`,   // fenêtres propres bungalow
};

// Fallback picsum stable par slug (jamais de 404)
export function getCategoryImage(slug?: string): string {
  if (slug && categoryImageMap[slug]) return categoryImageMap[slug];
  return `https://picsum.photos/seed/${slug ?? 'service-maison'}/800/500`;
}
