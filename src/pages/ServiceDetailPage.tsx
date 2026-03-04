// src/pages/ServiceDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useServices } from '../contexts/ServiceContext';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, MapPin, Star, User, Shield, Check, X, Upload, ImagePlus, Trash2 } from 'lucide-react';
import { getCategoryImage } from '../data/serviceImages';

type Service = {
  id: number;
  title: string;
  description: string;
  provider: {
    name: string;
    rating: number;
    total_reviews: number;
    verified: boolean;
    profile_picture: string | null;
  };
  category: string;
  categoryId: number | null;
  categorySlug: string;
  price: number;
  price_unit: string;
  duration: number;
  service_area: string;
  max_distance: number;
  instant_booking: boolean;
  rating: number;
  total_bookings: number;
  images: { id: number; url: string; is_primary: boolean }[];
  availability: { day: string; slots: string[] }[];
  reviews: {
    id: number;
    client: string;
    rating: number;
    comment: string;
    date: string;
  }[];
};

const ServiceDetailPage = () => {
  const { id } = useParams();
  const serviceId = parseInt(id || '1', 10);
  const { getServiceById } = useServices();
  const [service, setService] = useState<Service | null>(null);
  const [loadingService, setLoadingService] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showSoumissionModal, setShowSoumissionModal] = useState(false);

  useEffect(() => {
    setLoadingService(true);
    setNotFound(false);
    getServiceById(serviceId)
      .then((data: any) => {
        const p = data.provider ?? {};
        setService({
          id: data.id,
          title: data.title,
          description: data.description,
          provider: {
            name: [p.first_name, p.last_name].filter(Boolean).join(' ') || p.username || '',
            rating: parseFloat(p.rating) || 0,
            total_reviews: p.total_reviews ?? 0,
            verified: p.is_verified ?? false,
            profile_picture: p.profile_picture ?? null,
          },
          category: data.category?.name ?? String(data.category ?? ''),
          categoryId: data.category?.id ?? null,
          categorySlug: data.category?.slug ?? '',
          price: Number(data.price),
          price_unit: data.price_unit,
          duration: data.duration,
          service_area: data.service_area,
          max_distance: data.max_distance,
          instant_booking: data.instant_booking,
          rating: data.rating,
          total_bookings: data.total_bookings,
          images: data.images ?? [],
          availability: data.availability ?? [],
          reviews: data.reviews ?? [],
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingService(false));
  }, [serviceId]);

  if (loadingService) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  if (notFound || !service) return (
    <div className="p-8 text-center">
      <p className="text-xl font-semibold text-gray-700">Service introuvable</p>
      <p className="text-gray-400 mt-2">Ce service n'existe pas ou a été supprimé.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden shadow-lg mb-6">
            <img
              src={service.images[0]?.url || getCategoryImage(service.categorySlug)}
              alt={service.title}
              className="w-full h-96 object-cover"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{service.service_area}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{service.duration} min</span>
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" />{service.rating} ({service.total_bookings} réservations)</span>
            </div>
            <p className="text-gray-700 mb-6">{service.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-green-600" /><span>Prestataire vérifié</span></div>
              <div className="flex items-center gap-2"><Check className="w-5 h-5 text-blue-600" /><span>Réservation instantanée</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">Avis clients</h2>
            <div className="space-y-4">
              {service.reviews.map(review => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{review.client}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-coupdemain-primary">${service.price}</div>
              <div className="text-gray-600">{service.price_unit}</div>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <div className="font-semibold">{service.provider.name}</div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>{service.provider.rating}</span>
                  <span className="text-gray-500">({service.provider.total_reviews} avis)</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <Calendar className="inline w-4 h-4 mr-1 text-gray-400" />
                Date souhaitée <span className="font-normal text-gray-400">(optionnel)</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary text-sm"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                <Clock className="inline w-4 h-4 mr-1 text-gray-400" />
                Heure souhaitée <span className="font-normal text-gray-400">(optionnel)</span>
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary text-sm"
              >
                <option value="">Sélectionner une heure</option>
                <option value="8:00">8:00</option>
                <option value="9:00">9:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
              </select>
            </div>

            <button
              onClick={() => setShowSoumissionModal(true)}
              className="w-full bg-coupdemain-primary text-white py-3.5 rounded-xl font-semibold hover:bg-coupdemain-primary/90 transition text-base"
            >
              Demander Soumission
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              Gratuit · Les prestataires vous font une offre
            </p>
          </div>
        </div>
      </div>

      {showSoumissionModal && (
        <SoumissionModal
          service={service}
          preferredDate={selectedDate}
          preferredTime={selectedTime}
          onClose={() => setShowSoumissionModal(false)}
        />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Modale Demander Soumission                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */

type SoumissionModalProps = {
  service: Service;
  preferredDate: string;
  preferredTime: string;
  onClose: () => void;
};

const SoumissionModal: React.FC<SoumissionModalProps> = ({
  service,
  preferredDate,
  preferredTime,
  onClose,
}) => {
  const { user } = useAuth();


  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState('');
  const [serviceArea, setServiceArea] = useState(service.service_area);
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const d = new Date(); d.setHours(d.getHours() + 48);
    return d.toISOString().split('T')[0];
  });
  const [deadlineTime, setDeadlineTime] = useState('10:00');
  const [prefDate, setPrefDate] = useState(preferredDate);
  const [prefTime, setPrefTime] = useState(preferredTime);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotos = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    const combined = [...photos, ...newFiles].slice(0, 8); // max 8 photos
    setPhotos(combined);
    const urls = combined.map(f => URL.createObjectURL(f));
    setPreviews(prev => { prev.forEach(URL.revokeObjectURL); return urls; });
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    const urls = updated.map(f => URL.createObjectURL(f));
    setPreviews(prev => { prev.forEach(URL.revokeObjectURL); return urls; });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Vous devez être connecté pour demander une soumission.');
      return;
    }
    if (prefDate && prefTime) {
      const serviceDateTime = new Date(`${prefDate}T${prefTime}`);
      const deadlineDateTime = new Date(`${deadlineDate}T${deadlineTime}`);
      if (serviceDateTime.getTime() - deadlineDateTime.getTime() < 24 * 60 * 60 * 1000) {
        setError('Le délai de soumission doit être au moins 24h avant la date et l\'heure souhaitées du service.');
        return;
      }
    }
    if (photos.length === 0) {
      setError('Veuillez ajouter au moins une photo du chantier ou de la problématique.');
      return;
    }
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('service_area', serviceArea);
      formData.append('submission_deadline', new Date(`${deadlineDate}T${deadlineTime}`).toISOString());
      formData.append('preferred_dates', `${prefDate}${prefTime ? ' à ' + prefTime : ''}`);
      if (service.categoryId) formData.append('category_id', String(service.categoryId));
      photos.forEach(photo => formData.append('images', photo));

      await axios.post('service-requests/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl px-6 pt-6 pb-4 border-b border-gray-100 z-10">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Demander une soumission</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Décrivez votre projet — les prestataires vous feront une offre.
          </p>
        </div>

        {success ? (
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Demande envoyée !</h3>
            <p className="text-sm text-gray-500 mb-6">
              Les prestataires ont jusqu'au{' '}
              <strong>{new Date(`${deadlineDate}T${deadlineTime}`).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</strong>{' '}
              pour vous soumettre une offre.
            </p>
            <button
              onClick={onClose}
              className="bg-coupdemain-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-coupdemain-primary/90 transition"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Titre de la demande <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="Ex. : Remplacement robinet cuisine"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description du travail / problématique <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Décrivez en détail le travail à effectuer, l'état actuel, les matériaux concernés, l'urgence…"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary resize-none"
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse de prestation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={serviceArea}
                onChange={e => setServiceArea(e.target.value)}
                required
                placeholder="Ex. : 123 rue des Érables, Montréal"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
              />
            </div>

            {/* Délai de soumission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Délai accordé aux prestataires pour soumettre <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">Les prestataires pourront vous envoyer une offre jusqu'à cette date.</p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={e => setDeadlineDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  max={prefDate ? new Date(new Date(prefDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
                />
                <select
                  value={deadlineTime}
                  onChange={e => setDeadlineTime(e.target.value)}
                  required
                  className="w-36 border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
                >
                  <option value="8:00">8:00</option>
                  <option value="9:00">9:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                </select>
              </div>
            </div>

            {/* Date + Heure souhaitées sur la même ligne */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date et heure souhaitées pour le service <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={prefDate}
                  onChange={e => setPrefDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
                />
                <select
                  value={prefTime}
                  onChange={e => setPrefTime(e.target.value)}
                  required
                  className="w-36 border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
                >
                  <option value="">Heure</option>
                  <option value="8:00">8:00</option>
                  <option value="9:00">9:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="13:00">13:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                </select>
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Photos du problème / du chantier <span className="text-red-500">*</span>
                <span className="font-normal text-gray-400 ml-1">(max 8)</span>
              </label>

              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      </button>
                    </div>
                  ))}
                  {previews.length < 8 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-coupdemain-primary hover:bg-coupdemain-primary/5 transition"
                    >
                      <ImagePlus className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                </div>
              )}

              {previews.length === 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-coupdemain-primary hover:bg-coupdemain-primary/5 transition text-gray-400"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Cliquez pour ajouter des photos</span>
                  <span className="text-xs">JPG, PNG, HEIC — max 8 fichiers</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handlePhotos(e.target.files)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}

            {!user && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3">
                Vous devez être <a href="/connexion" className="underline font-medium">connecté</a> pour envoyer une demande de soumission.
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !user}
              className="w-full bg-coupdemain-primary text-white py-3.5 rounded-xl font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-60 text-base"
            >
              {isSubmitting ? 'Envoi en cours…' : 'Envoyer la demande'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailPage;
