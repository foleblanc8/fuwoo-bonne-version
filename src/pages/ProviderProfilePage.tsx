// src/pages/ProviderProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Shield, MapPin, User, Award, BadgeCheck } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import SEO from '../components/SEO';

type PortfolioPhoto = { id: number; image: string; caption: string };

type ProviderCredential = {
  id: number;
  credential_type: string;
  credential_type_label: string;
  title: string;
  license_number: string;
  issued_by: string;
  issued_year: number | null;
  expires_at: string | null;
  is_verified: boolean;
};

const CREDENTIAL_COLORS: Record<string, string> = {
  rbq:       'bg-orange-50 border-orange-200 text-orange-800',
  ccq:       'bg-blue-50 border-blue-200 text-blue-800',
  cmeq:      'bg-yellow-50 border-yellow-200 text-yellow-800',
  cmmtq:     'bg-cyan-50 border-cyan-200 text-cyan-800',
  insurance: 'bg-green-50 border-green-200 text-green-800',
  skill:     'bg-purple-50 border-purple-200 text-purple-800',
  diploma:   'bg-indigo-50 border-indigo-200 text-indigo-800',
  other:     'bg-gray-50 border-gray-200 text-gray-700',
};

type ProviderUser = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  profile_picture: string | null;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  address: string | null;
  date_joined: string | null;
};

type ProviderService = {
  id: number;
  title: string;
  category: { id: number; name: string; slug: string } | null;
  rating: number;
  total_bookings: number;
  service_area: string;
};

type ProviderReview = {
  id: number;
  client: { first_name: string; last_name: string; username: string } | null;
  rating: number;
  comment: string;
  quality_rating: number | null;
  punctuality_rating: number | null;
  communication_rating: number | null;
  created_at: string;
};

const ProviderProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const providerId = parseInt(id || '0', 10);

  const [provider, setProvider] = useState<ProviderUser | null>(null);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioPhoto[]>([]);
  const [credentials, setCredentials] = useState<ProviderCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightbox, setLightbox] = useState<PortfolioPhoto | null>(null);

  useEffect(() => {
    if (!providerId) { setNotFound(true); setLoading(false); return; }
    setLoading(true);
    Promise.all([
      axios.get(`users/${providerId}/`),
      axios.get(`services/?provider=${providerId}&is_active=true`),
      axios.get(`reviews/?provider_id=${providerId}`),
      axios.get(`portfolio/?provider=${providerId}`),
      axios.get(`credentials/?provider=${providerId}`),
    ])
      .then(([userRes, servicesRes, reviewsRes, portfolioRes, credentialsRes]) => {
        setProvider(userRes.data as ProviderUser);
        const sd = servicesRes.data as { results?: ProviderService[] } | ProviderService[];
        setServices(Array.isArray(sd) ? sd : sd.results || []);
        const rd = reviewsRes.data as { results?: ProviderReview[] } | ProviderReview[];
        setReviews(Array.isArray(rd) ? rd : rd.results || []);
        const pd = portfolioRes.data as { results?: PortfolioPhoto[] } | PortfolioPhoto[];
        setPortfolio(Array.isArray(pd) ? pd : pd.results || []);
        const cd = credentialsRes.data as { results?: ProviderCredential[] } | ProviderCredential[];
        setCredentials(Array.isArray(cd) ? cd : cd.results || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [providerId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  if (notFound || !provider) return (
    <div className="p-8 text-center">
      <p className="text-xl font-semibold text-gray-700">Prestataire introuvable</p>
      <p className="text-gray-400 mt-2">Ce profil n'existe pas ou a été supprimé.</p>
    </div>
  );

  const fullName = [provider.first_name, provider.last_name].filter(Boolean).join(' ') || provider.username;
  const isNew = provider.date_joined
    ? (Date.now() - new Date(provider.date_joined).getTime()) < 30 * 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <SEO
        title={fullName}
        description={provider.bio
          ? `${fullName} — ${provider.bio.slice(0, 140)}`
          : `Profil de ${fullName} sur Coupdemain. Note ${Number(provider.rating).toFixed(1)}/5 basée sur ${provider.total_reviews} avis.`}
        url={`/provider/${providerId}`}
      />
      {/* Bannière profil */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
          {provider.profile_picture
            ? <img src={provider.profile_picture} alt={fullName} className="w-full h-full object-cover" />
            : <User className="w-10 h-10 text-gray-400" />
          }
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
            {provider.is_verified && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3" /> Vérifié
              </span>
            )}
            {isNew && (
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                Nouveau
              </span>
            )}
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              {Number(provider.rating).toFixed(1)}
              <span className="text-gray-400">({provider.total_reviews} avis)</span>
            </span>
            {provider.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />{provider.address}
              </span>
            )}
          </div>
          {provider.bio && <p className="text-gray-600 text-sm max-w-xl">{provider.bio}</p>}
        </div>
      </div>

      {/* Portfolio */}
      {portfolio.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Réalisations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {portfolio.map(photo => (
              <button
                key={photo.id}
                onClick={() => setLightbox(photo)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 focus:outline-none"
              >
                <img
                  src={photo.image}
                  alt={photo.caption || 'Réalisation'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium truncate">{photo.caption}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img
              src={lightbox.image}
              alt={lightbox.caption}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
            {lightbox.caption && (
              <p className="text-white text-sm text-center mt-3">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Services proposés</h2>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(s => (
              <ServiceCard
                key={s.id}
                title={s.title}
                categorySlug={s.category?.slug}
                rating={s.rating}
                totalBookings={s.total_bookings}
                serviceArea={s.service_area}
              />
            ))}
          </div>
        </section>
      )}

      {/* Compétences & certifications */}
      {credentials.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-coupdemain-primary" />
            Compétences & certifications
          </h2>
          <div className="flex flex-wrap gap-2">
            {credentials.map(c => (
              <div key={c.id}
                className={`flex items-start gap-2 border rounded-xl px-3.5 py-2.5 text-sm ${CREDENTIAL_COLORS[c.credential_type] ?? CREDENTIAL_COLORS.other}`}>
                <BadgeCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold leading-tight">{c.title}</p>
                  <p className="text-xs opacity-70">{c.credential_type_label}</p>
                  {c.license_number && (
                    <p className="text-xs mt-0.5">
                      N° <span className="font-mono">{c.license_number}</span>
                      {c.issued_by && ` · ${c.issued_by}`}
                      {c.issued_year && ` · ${c.issued_year}`}
                    </p>
                  )}
                  {!c.license_number && (c.issued_by || c.issued_year) && (
                    <p className="text-xs opacity-70">{[c.issued_by, c.issued_year].filter(Boolean).join(' · ')}</p>
                  )}
                  {c.expires_at && (
                    <p className="text-xs opacity-60">Expire : {new Date(c.expires_at).toLocaleDateString('fr-CA')}</p>
                  )}
                  {c.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full mt-1">
                      <Shield className="w-3 h-3" />Vérifié
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Avis */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Avis clients</h2>
          {reviews.length > 0 && (
            <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {reviews.length} avis
            </span>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun avis pour l'instant.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm divide-y">
            {reviews.map(r => {
              const clientName = r.client
                ? ([r.client.first_name, r.client.last_name].filter(Boolean).join(' ') || r.client.username)
                : 'Client';
              const hasSubRatings = r.quality_rating || r.punctuality_rating || r.communication_rating;
              return (
                <div key={r.id} className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-coupdemain-primary/10 flex items-center justify-center text-xs font-bold text-coupdemain-primary">
                        {clientName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-sm">{clientName}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-yellow-500 fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('fr-CA')}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{r.comment}</p>
                  {hasSubRatings && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {r.quality_rating && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          Qualité {r.quality_rating}/5
                        </span>
                      )}
                      {r.punctuality_rating && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          Ponctualité {r.punctuality_rating}/5
                        </span>
                      )}
                      {r.communication_rating && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          Communication {r.communication_rating}/5
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProviderProfilePage;
