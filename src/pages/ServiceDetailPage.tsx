import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, User, DollarSign, Shield, Check, X } from 'lucide-react';

// Page de détail d'un service
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

const ServiceDetailPage = ({ serviceId = 1 }) => {
  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Simuler les données d'un service
  useEffect(() => {
    setService({
      id: serviceId,
      title: "Plomberie résidentielle",
      description: "Service complet de plomberie incluant réparations, installations et urgences. Plus de 10 ans d'expérience dans le domaine.",
      provider: {
        name: "Jean Dupont",
        rating: 4.8,
        total_reviews: 156,
        verified: true,
        profile_picture: null
      },
      category: "Plomberie",
      price: 75,
      price_unit: "par heure",
      duration: 60,
      service_area: "Montréal",
      max_distance: 25,
      instant_booking: true,
      rating: 4.8,
      total_bookings: 234,
      images: [
        { id: 1, url: '/api/placeholder/600/400', is_primary: true }
      ],
      availability: [
        { day: "Lundi", slots: ["9:00", "10:00", "14:00", "15:00"] },
        { day: "Mardi", slots: ["9:00", "11:00", "14:00", "16:00"] },
        { day: "Mercredi", slots: ["10:00", "14:00", "15:00"] }
      ],
      reviews: [
        {
          id: 1,
          client: "Marie L.",
          rating: 5,
          comment: "Excellent service, très professionnel!",
          date: "2024-03-15"
        },
        {
          id: 2,
          client: "Pierre M.",
          rating: 4,
          comment: "Bon travail, ponctuel et efficace.",
          date: "2024-03-10"
        }
      ]
    });
  }, [serviceId]);

  if (!service) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2">
          {/* Image principale */}
          <div className="rounded-2xl overflow-hidden shadow-lg mb-6">
            <img 
              src="/api/placeholder/800/500" 
              alt={service.title}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Informations du service */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
            <div className="flex items-center gap-4 text-gray-600 mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {service.service_area}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {service.duration} min
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {service.rating} ({service.total_bookings} réservations)
              </span>
            </div>
            <p className="text-gray-700 mb-6">{service.description}</p>

            {/* Caractéristiques */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Prestataire vérifié</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span>Réservation instantanée</span>
              </div>
            </div>
          </div>

          {/* Section avis */}
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
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                          />
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

        {/* Colonne latérale - Réservation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-fuwoo-primary">
                ${service.price}
              </div>
              <div className="text-gray-600">{service.price_unit}</div>
            </div>

            {/* Prestataire */}
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

            {/* Sélection date et heure */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuwoo-primary"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Heure</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuwoo-primary"
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
              className="w-full bg-fuwoo-primary text-white py-3 rounded-xl font-semibold hover:bg-fuwoo-primary/90 transition"
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

      {/* Modal de réservation */}
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

// Modal de confirmation de réservation
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simuler l'envoi de la réservation
    setTimeout(() => {
      alert('Réservation confirmée!');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Confirmer la réservation</h2>

        {/* Résumé */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-2">{service.title}</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(date).toLocaleDateString('fr-CA')}</span>
            </div>
            <div className="flex justify-between">
              <span>Heure:</span>
              <span>{time}</span>
            </div>
            <div className="flex justify-between">
              <span>Durée:</span>
              <span>{service.duration} minutes</span>
            </div>
            <div className="flex justify-between font-semibold text-black mt-2 pt-2 border-t">
              <span>Total:</span>
              <span>${service.price}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Adresse du service
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuwoo-primary"
              rows={2}
              required
              placeholder="123 Rue Example, Montréal, QC"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Notes pour le prestataire (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-fuwoo-primary"
              rows={3}
              placeholder="Instructions spéciales, code d'accès, etc."
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-fuwoo-primary text-white py-3 rounded-xl font-semibold hover:bg-fuwoo-primary/90 transition disabled:opacity-50"
          >
            {isProcessing ? 'Traitement...' : 'Confirmer la réservation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceDetailPage;