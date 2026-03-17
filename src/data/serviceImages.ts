// src/data/serviceImages.ts
// Images Unsplash par catégorie — stables et haute qualité

const BASE = 'https://images.unsplash.com';

export const categoryImageMap: Record<string, string> = {
  // Intérieur
  'menage-residentiel':   `${BASE}/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80`, // aspirateur/nettoyage
  'nettoyage-profondeur': `${BASE}/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80`, // boîtes carton déménagement
  'plomberie':            `${BASE}/photo-1676210134188-4c05dd172f89?auto=format&fit=crop&w=800&q=80`, // homme travaillant sur un tuyau dans un mur
  'electricite':          `${BASE}/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=800&q=80`,   // panneau électrique
  'peinture':             `${BASE}/photo-1688372199140-cade7ae820fe?auto=format&fit=crop&w=800&q=80`, // homme peignant un mur en jaune
  'demenagement':         `${BASE}/photo-1614359835514-92f8ba196357?auto=format&fit=crop&w=800&q=80`, // déménagement

  // Extérieur / paysager
  'tonte-pelouse':        `${BASE}/photo-1590820292118-e256c3ac2676?auto=format&fit=crop&w=800&q=80`, // tondeuse jaune et noire sur gazon vert
  'deneigement':          `${BASE}/photo-1483385573908-0a2108937c4a?auto=format&fit=crop&w=800&q=80`, // personne pelletant la neige
  'nettoyage-terrain':    `${BASE}/photo-1634081727680-fa43e3237d5a?auto=format&fit=crop&w=800&q=80`, // râteau rouge sur tas de feuilles
  'entretien-jardin':     `${BASE}/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80`, // jardin fleuri
  'taille-haies':         `${BASE}/photo-1734079692079-172d8243ebd3?auto=format&fit=crop&w=800&q=80`, // personne en veste verte avec tronçonneuse
  'elagage-arbres':       `${BASE}/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80`, // grand arbre
  'amenagement-paysager': `${BASE}/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=800&q=80`,   // aménagement paysager
  'entretien-piscine':    `${BASE}/photo-1585156140347-eb5e94dfe4f1?auto=format&fit=crop&w=800&q=80`, // maison avec piscine extérieure
  'nettoyage-gouttieres': `${BASE}/photo-1665442348932-6e16d72fe163?auto=format&fit=crop&w=800&q=80`, // feuilles dans gouttière
  'nettoyage-terrasse':   `${BASE}/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80`, // beau patio propre
  'lavage-vitres':        `${BASE}/photo-1635445818409-64a0ff92eb39?auto=format&fit=crop&w=800&q=80`, // homme sur échelle travaillant sur un bâtiment

  // Travaux résidentiels hors CCQ
  'menuiserie':            `${BASE}/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80`, // charpentier travaillant le bois
  'toiture':               `${BASE}/photo-1632823471565-1ecdf5c6da2f?auto=format&fit=crop&w=800&q=80`, // toiture bardeaux
  'pose-planchers':        `${BASE}/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80`, // pose de plancher bois
  'pose-ceramique':        `${BASE}/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80`, // pose de carrelage
  'reparations-generales': `${BASE}/photo-1621905251189-08b1059cd735?auto=format&fit=crop&w=800&q=80`, // homme à tout faire avec outils
  'clotures-terrasses':    `${BASE}/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80`, // belle terrasse en bois
  'calfeutrage':           `${BASE}/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80`, // fenêtre avec isolation
  'nettoyage-tapis':       `${BASE}/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=80`, // nettoyage tapis vapeur
  'montage-meubles':       `${BASE}/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80`, // montage meuble
  'impermeabilisation':    `${BASE}/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80`, // sous-sol imperméabilisé
};

// Fallback picsum stable par slug (jamais de 404)
export function getCategoryImage(slug?: string): string {
  if (slug && categoryImageMap[slug]) return categoryImageMap[slug];
  return `https://picsum.photos/seed/${slug ?? 'service-maison'}/800/500`;
}
