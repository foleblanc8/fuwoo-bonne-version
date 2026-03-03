// src/pages/ServiceDetailPage.tsx
// Page de détail d'un service connecté à l'API
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '../contexts/ServiceContext';
import { useBookings } from '../contexts/BookingContext';
import { Calendar, Clock, MapPin, Star, User, Shield, Check, X } from 'lucide-react';

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
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    getServiceById(serviceId)
      .then((data: any) => {
        // Adapt data to match the Service type exactly
        setService({
          id: data.id,
          title: data.title,
          description: data.description,
          provider: data.provider,
          category: typeof data.category === 'string' ? data.category : String(data.category),
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
      .catch((err) => console.error('Erreur récupération service:', err));
  }, [serviceId, getServiceById]);

  if (!service) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden shadow-lg mb-6">
            <img
              src={service.images[0]?.url || '/placeholder.jpg'}
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

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Heure</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
              >
                <option value="">Sélectionner une heure</option>
                <option value="9:00">9:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
              </select>
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              className="w-full bg-coupdemain-primary text-white py-3 rounded-xl font-semibold hover:bg-coupdemain-primary/90 transition"
              disabled={!selectedDate || !selectedTime}
            >
              Réserver maintenant
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Annulation gratuite jusqu'à 24h avant
            </p>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          service={service}
          date={selectedDate}
          time={selectedTime}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

type BookingModalProps = {
  service: Service;
  date: string;
  time: string;
  onClose: () => void;
};

const BookingModal: React.FC<BookingModalProps> = ({ service, date, time, onClose }) => {
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { createBooking } = useBookings();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      await createBooking({
        service: service.id,
        date,
        start_time: time,
        service_address: address,
        client_notes: notes,
      });
      alert('Réservation confirmée ! ✅');
      onClose();
    } catch (error) {
      alert("Une erreur s'est produite lors de la réservation.");
      console.error("Erreur lors de la réservation:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Confirmer la réservation</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Adresse de prestation</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes pour le prestataire</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
              rows={3}
              placeholder="Informations complémentaires (facultatif)"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              <Calendar className="inline w-4 h-4 mr-1" />
              {date}
            </span>
            <span>
              <Clock className="inline w-4 h-4 mr-1" />
              {time}
            </span>
          </div>
          <button
            type="submit"
            className="w-full bg-coupdemain-primary text-white py-3 rounded-xl font-semibold hover:bg-coupdemain-primary/90 transition"
            disabled={isProcessing || !address}
          >
            {isProcessing ? 'Réservation...' : 'Confirmer la réservation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
