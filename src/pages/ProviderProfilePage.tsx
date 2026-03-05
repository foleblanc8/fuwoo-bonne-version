// src/pages/ProviderProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Shield, MapPin, User } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';

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
};

type ProviderService = {
  id: number;
  title: string;
  category: { id: number; name: string; slug: string } | null;
  price: string;
  price_unit: string;
  rating: number;
  total_bookings: number;
  service_area: string;
};

type ProviderReview = {
  id: number;
  client: { first_name: string; last_name: string; username: string } | null;
  rating: number;
  comment: string;
  created_at: string;
};

const ProviderProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const providerId = parseInt(id || '0', 10);

  const [provider, setProvider] = useState<ProviderUser | null>(null);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!providerId) { setNotFound(true); setLoading(false); return; }
    setLoading(true);
    Promise.all([
      axios.get(`users/${providerId}/`),
      axios.get(`services/?provider=${providerId}&is_active=true`),
      axios.get(`reviews/?provider_id=${providerId}`),
    ])
      .then(([userRes, servicesRes, reviewsRes]) => {
        setProvider(userRes.data as ProviderUser);
        const sd = servicesRes.data as { results?: ProviderService[] } | ProviderService[];
        setServices(Array.isArray(sd) ? sd : sd.results || []);
        const rd = reviewsRes.data as { results?: ProviderReview[] } | ProviderReview[];
        setReviews(Array.isArray(rd) ? rd : rd.results || []);
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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
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
                price={s.price}
                priceUnit={s.price_unit}
                rating={s.rating}
                totalBookings={s.total_bookings}
                serviceArea={s.service_area}
                linkTo={`/service/${s.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Avis */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Avis clients</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun avis pour l'instant.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm divide-y">
            {reviews.map(r => {
              const clientName = r.client
                ? ([r.client.first_name, r.client.last_name].filter(Boolean).join(' ') || r.client.username)
                : 'Client';
              return (
                <div key={r.id} className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{clientName}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-yellow-500 fill-current' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('fr-CA')}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{r.comment}</p>
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
