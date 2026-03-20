// src/data/categoryStyles.ts
import {
  Sparkles, ShieldCheck, Scissors, Snowflake, Paintbrush, Wrench, Zap, Truck,
  Droplets, Leaf, Waves, TreePine, Home, Map, Bug, Hammer, LayoutGrid,
  Fence, Wind, Box, Eye, Layers, Filter, Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CategoryStyle = { gradient: string; icon: LucideIcon };

export const CATEGORY_STYLE: Record<string, CategoryStyle> = {
  'menage-residentiel':   { gradient: 'from-emerald-400 to-teal-500',    icon: Sparkles },
  'nettoyage-profondeur': { gradient: 'from-blue-400 to-indigo-500',     icon: ShieldCheck },
  'tonte-pelouse':        { gradient: 'from-green-400 to-emerald-500',   icon: Scissors },
  'entretien-jardin':     { gradient: 'from-lime-400 to-green-500',      icon: Leaf },
  'deneigement':          { gradient: 'from-sky-300 to-blue-500',        icon: Snowflake },
  'peinture':             { gradient: 'from-amber-400 to-orange-500',    icon: Paintbrush },
  'plomberie':            { gradient: 'from-indigo-400 to-violet-500',   icon: Wrench },
  'electricite':          { gradient: 'from-yellow-400 to-amber-500',    icon: Zap },
  'demenagement':         { gradient: 'from-orange-400 to-red-400',      icon: Truck },
  'lavage-vitres':        { gradient: 'from-cyan-400 to-sky-500',        icon: Eye },
  'nettoyage-terrain':    { gradient: 'from-amber-500 to-orange-600',    icon: Leaf },
  'entretien-piscine':    { gradient: 'from-blue-400 to-cyan-500',       icon: Waves },
  'taille-haies':         { gradient: 'from-green-500 to-teal-600',      icon: Scissors },
  'elagage-arbres':       { gradient: 'from-emerald-500 to-green-700',   icon: TreePine },
  'nettoyage-gouttieres': { gradient: 'from-slate-400 to-gray-600',      icon: Filter },
  'nettoyage-terrasse':   { gradient: 'from-stone-400 to-slate-600',     icon: Home },
  'amenagement-paysager': { gradient: 'from-lime-500 to-green-600',      icon: Map },
  'extermination':        { gradient: 'from-red-400 to-rose-500',        icon: Bug },
  'menuiserie':           { gradient: 'from-amber-500 to-yellow-600',    icon: Hammer },
  'toiture':              { gradient: 'from-slate-500 to-gray-700',      icon: Home },
  'pose-planchers':       { gradient: 'from-amber-600 to-orange-700',    icon: LayoutGrid },
  'pose-ceramique':       { gradient: 'from-teal-400 to-cyan-500',       icon: Layers },
  'reparations-generales':{ gradient: 'from-gray-500 to-slate-600',      icon: Wrench },
  'clotures-terrasses':   { gradient: 'from-amber-700 to-orange-800',    icon: Fence },
  'calfeutrage':          { gradient: 'from-blue-300 to-sky-400',        icon: Wind },
  'nettoyage-tapis':      { gradient: 'from-purple-400 to-violet-500',   icon: Sparkles },
  'montage-meubles':      { gradient: 'from-indigo-400 to-blue-500',     icon: Box },
  'impermeabilisation':   { gradient: 'from-slate-600 to-gray-800',      icon: Droplets },
};

export const DEFAULT_CATEGORY_STYLE: CategoryStyle = { gradient: 'from-gray-400 to-slate-500', icon: Star };

export function getCategoryStyle(slug: string): CategoryStyle {
  return CATEGORY_STYLE[slug] ?? DEFAULT_CATEGORY_STYLE;
}
