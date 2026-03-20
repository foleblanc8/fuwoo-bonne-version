// src/pages/Services.tsx
import React, { useEffect, useState, useRef } from "react";
import SEO from "../components/SEO";
import { useServices } from "../contexts/ServiceContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Search, MapPin, LocateFixed, Loader, X, Check, Upload, ImagePlus, Trash2, Lock,
  Sparkles, ShieldCheck, Scissors, Snowflake, PaintBucket, Wrench, Zap, Truck,
  Droplets, Leaf, Waves, TreePine, Home, Map, Bug, Hammer, LayoutGrid,
  Fence, Wind, Box, Paintbrush, Eye, Layers, Filter, Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCategoryImage } from "../data/serviceImages";
import axios from "axios";

// ─── Gradient + icône par catégorie ──────────────────────────────────────────

const CATEGORY_STYLE: Record<string, { gradient: string; icon: LucideIcon }> = {
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

const DEFAULT_STYLE = { gradient: 'from-gray-400 to-slate-500', icon: Star };

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  is_active: boolean;
  provider_count: number;
};

// ─── Request Modal ─────────────────────────────────────────────────────────────

function RequestModal({
  category,
  locationLabel,
  geoCoords,
  onClose,
}: {
  category: Category;
  locationLabel: string;
  geoCoords: { lat: number; lng: number } | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle]           = useState(category.name);
  const [description, setDescription] = useState('');
  const [serviceArea, setServiceArea] = useState(locationLabel);
  const [address, setAddress]       = useState('');
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date(); d.setHours(d.getHours() + 48);
    return d.toISOString().split('T')[0];
  });
  const [deadlineTime, setDeadlineTime] = useState('10:00');
  const [prefDate, setPrefDate]     = useState('');
  const [prefTime, setPrefTime]     = useState('');
  const [photos, setPhotos]         = useState<File[]>([]);
  const [previews, setPreviews]     = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  const handlePhotos = (files: FileList | null) => {
    if (!files) return;
    const combined = [...photos, ...Array.from(files).filter(f => f.type.startsWith('image/'))].slice(0, 8);
    setPhotos(combined);
    const urls = combined.map(f => URL.createObjectURL(f));
    setPreviews(prev => { prev.forEach(URL.revokeObjectURL); return urls; });
  };

  const removePhoto = (i: number) => {
    const updated = photos.filter((_, idx) => idx !== i);
    setPhotos(updated);
    const urls = updated.map(f => URL.createObjectURL(f));
    setPreviews(prev => { prev.forEach(URL.revokeObjectURL); return urls; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setError('Vous devez être connecté pour envoyer une demande.'); return; }
    if (photos.length === 0) { setError('Ajoutez au moins une photo du travail à effectuer.'); return; }
    if (prefDate && prefTime) {
      const serviceDateTime = new Date(`${prefDate}T${prefTime}`);
      const deadlineDateTime = new Date(`${deadlineDate}T${deadlineTime}`);
      if (serviceDateTime.getTime() - deadlineDateTime.getTime() < 24 * 60 * 60 * 1000) {
        setError("Le délai de soumission doit être au moins 24h avant la date souhaitée du service.");
        return;
      }
    }
    setSubmitting(true);
    setError('');
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('service_area', serviceArea);
      if (address.trim()) form.append('address', address.trim());
      form.append('submission_deadline', new Date(`${deadlineDate}T${deadlineTime}`).toISOString());
      form.append('preferred_dates', `${prefDate}${prefTime ? ' à ' + prefTime : ''}`);
      form.append('category_id', String(category.id));
      if (geoCoords) {
        form.append('latitude', String(geoCoords.lat));
        form.append('longitude', String(geoCoords.lng));
      }
      photos.forEach(p => form.append('images', p));
      await axios.post('service-requests/', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl px-6 pt-5 pb-4 border-b border-gray-100 z-10">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{CATEGORY_EMOJI[category.slug] ?? '🛠️'}</span>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
                <p className="text-xs text-gray-400">{category.provider_count} prestataire{category.provider_count !== 1 ? 's' : ''} offre{category.provider_count !== 1 ? 'nt' : '  '} ce service</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {success ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Demande envoyée !</h3>
            <p className="text-sm text-gray-500 mb-6">
              Les prestataires de la région ont été notifiés. Vous recevrez des offres dans votre tableau de bord.
            </p>
            <button onClick={onClose}
              className="bg-coupdemain-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-coupdemain-primary/90 transition">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Titre <span className="text-red-500">*</span>
              </label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Décrivez le travail <span className="text-red-500">*</span>
              </label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4}
                placeholder="Ex. : Robinet qui coule dans la cuisine, besoin de remplacement…"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary resize-none" />
            </div>

            {/* Zone publique */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ville / Quartier <span className="text-red-500">*</span>
              </label>
              <input type="text" value={serviceArea} onChange={e => setServiceArea(e.target.value)} required
                placeholder="Ex. : Plateau-Mont-Royal, Montréal"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary" />
              <p className="text-xs text-gray-400 mt-1">Visible par tous les prestataires</p>
            </div>

            {/* Adresse privée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                Adresse exacte <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Ex. : 123 rue des Érables, app. 2"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary" />
              <p className="text-xs text-gray-400 mt-1">Partagée uniquement avec le prestataire retenu</p>
            </div>

            {/* Date souhaitée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date et heure souhaitées <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input type="date" value={prefDate} onChange={e => setPrefDate(e.target.value)} required
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary" />
                <select value={prefTime} onChange={e => setPrefTime(e.target.value)} required
                  className="w-32 border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary">
                  <option value="">Heure</option>
                  {['8:00','9:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00'].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Délai soumission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Les prestataires peuvent soumissionner jusqu'au <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input type="date" value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)} required
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary" />
                <select value={deadlineTime} onChange={e => setDeadlineTime(e.target.value)}
                  className="w-32 border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary">
                  {['8:00','9:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00'].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Photos <span className="text-red-500">*</span>
                <span className="font-normal text-gray-400 ml-1">(max 8)</span>
              </label>
              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition">
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  ))}
                  {previews.length < 8 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-coupdemain-primary hover:bg-coupdemain-primary/5 transition">
                      <ImagePlus className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                </div>
              )}
              {previews.length === 0 && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-coupdemain-primary hover:bg-coupdemain-primary/5 transition text-gray-400">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Ajouter des photos</span>
                  <span className="text-xs">JPG, PNG — max 8</span>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => handlePhotos(e.target.files)} />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

            {!user && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
                Vous devez être <a href="/connexion" className="underline font-medium">connecté</a> pour envoyer une demande.
              </p>
            )}

            <button type="submit" disabled={submitting || !user}
              className="w-full bg-coupdemain-primary text-white py-4 rounded-xl font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-60 text-base">
              {submitting ? 'Envoi…' : 'Envoyer ma demande de soumission'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────

const Services = () => {
  const { categories, fetchCategories } = useServices();
  const [search, setSearch]             = useState('');
  const [city, setCity]                 = useState('');
  const [geoCoords, setGeoCoords]       = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus]       = useState<'idle' | 'loading' | 'success'>('idle');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setCity('');
        setGeoStatus('success');
      },
      () => setGeoStatus('idle'),
      { timeout: 8000 }
    );
  };

  const clearLocation = () => {
    setCity('');
    setGeoCoords(null);
    setGeoStatus('idle');
  };

  const locationLabel = geoStatus === 'success' ? 'Position actuelle' : city;

  const filtered = (categories as unknown as Category[]).filter(c =>
    c.is_active !== false &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO
        title="Trouver un pro"
        description="Publiez votre demande gratuitement et recevez des soumissions de prestataires vérifiés près de chez vous. Ménage, plomberie, déneigement, peinture et plus."
        url="/services"
      />

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Quel service cherchez-vous ?
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mb-8">
            Choisissez un service — des prestataires de votre région vous feront une offre gratuitement.
          </p>

          {/* Barre recherche + localisation */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            {/* Recherche service */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Rechercher un service…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coupdemain-primary text-sm bg-white" />
            </div>

            {/* Localisation */}
            <div className="relative sm:w-64">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type="text"
                placeholder="Ville ou région…"
                value={geoStatus === 'success' ? '' : city}
                onChange={e => { setCity(e.target.value); setGeoCoords(null); setGeoStatus('idle'); }}
                disabled={geoStatus === 'success'}
                className="w-full pl-10 pr-10 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coupdemain-primary text-sm bg-white disabled:bg-green-50 disabled:border-green-300" />
              {geoStatus === 'success' && (
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-green-700 font-medium pointer-events-none">
                  Position actuelle ✓
                </span>
              )}
              <button type="button"
                onClick={geoStatus === 'success' ? clearLocation : handleGeolocate}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-coupdemain-primary transition p-1"
                title={geoStatus === 'success' ? 'Retirer la géolocalisation' : 'Utiliser ma position'}>
                {geoStatus === 'loading'
                  ? <Loader className="w-4 h-4 animate-spin text-coupdemain-primary" />
                  : geoStatus === 'success'
                  ? <X className="w-4 h-4 text-green-600" />
                  : <LocateFixed className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Localisation active */}
          {locationLabel && (
            <p className="mt-3 text-sm text-gray-500">
              Affichage des services pour : <span className="font-medium text-gray-800">{locationLabel}</span>
            </p>
          )}
        </div>
      </div>

      {/* Grille catégories */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">Aucune catégorie trouvée</p>
            <p className="text-sm mt-1">Essayez un autre terme.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map(cat => {
              const style = CATEGORY_STYLE[cat.slug] ?? DEFAULT_STYLE;
              const Icon = style.icon;
              return (
                <button key={cat.id} onClick={() => setSelectedCategory(cat)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-left">
                  {/* Photo + overlay gradient + icône */}
                  <div className="relative h-32 sm:h-36 overflow-hidden">
                    <img
                      src={getCategoryImage(cat.slug)}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Overlay gradient coloré semi-transparent */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-70`} />
                    {/* Badge prestataires */}
                    {cat.provider_count > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-black/25 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                          {cat.provider_count} pro{cat.provider_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {/* Icône centrée */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <Icon className="w-7 h-7 text-white drop-shadow-sm" />
                      </div>
                    </div>
                  </div>
                  {/* Contenu */}
                  <div className="p-4">
                    <p className="font-bold text-gray-900 text-sm leading-snug">{cat.name}</p>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{cat.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Comment ça marche */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { emoji: '📋', title: 'Décrivez votre projet', desc: 'Quelques lignes et des photos suffisent.' },
            { emoji: '📬', title: 'Recevez des offres', desc: 'Des prestataires de votre région vous contactent.' },
            { emoji: '✅', title: 'Choisissez la meilleure', desc: 'Comparez et acceptez l\'offre qui vous convient.' },
          ].map(step => (
            <div key={step.title} className="flex flex-col items-center gap-3">
              <span className="text-4xl">{step.emoji}</span>
              <h3 className="font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal demande */}
      {selectedCategory && (
        <RequestModal
          category={selectedCategory}
          locationLabel={locationLabel}
          geoCoords={geoCoords}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
};

export default Services;
