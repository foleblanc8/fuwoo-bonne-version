import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { Calendar, Clock, DollarSign, Star, TrendingUp, AlertCircle, CheckCircle, XCircle, User, MessageSquare, Settings, LogOut, Plus, Filter, Search } from 'lucide-react';

// Dashboard Client
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

type Booking = {
  id: number;
  service: string;
  provider: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: number;
};

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    activeBookings: 2,
    completedServices: 15,
    totalSpent: 1250,
    savedProviders: 8
  });

  useEffect(() => {
    // Simuler le chargement des réservations
    setBookings([
      {
        id: 1,
        service: "Plomberie - Réparation de fuite",
        provider: "Jean Dupont",
        date: "2024-04-15",
        time: "10:00",
        status: "confirmed",
        price: 150
      },
      {
        id: 2,
        service: "Ménage résidentiel",
        provider: "Marie Martin",
        date: "2024-04-10",
        time: "14:00",
        status: "completed",
        price: 80
      }
    ]);
  }, []);

  const getStatusColor = (status: BookingStatus): string => {
    switch(status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: BookingStatus): string => {
    switch(status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getStatusIcon = (status: BookingStatus): JSX.Element | null => {
    switch(status) {
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-fuwoo-primary">Fuwoo</h2>
          <p className="text-sm text-gray-600 mt-1">Espace Client</p>
        </div>
        
        <nav className="mt-6">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition ${
              activeTab === 'bookings' ? 'bg-fuwoo-primary/10 text-fuwoo-primary border-r-4 border-fuwoo-primary' : ''
            }`}
          >
            <Calendar className="w-5 h-5" />
            Mes réservations
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition ${
              activeTab === 'messages' ? 'bg-fuwoo-primary/10 text-fuwoo-primary border-r-4 border-fuwoo-primary' : ''
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Messages
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition ${
              activeTab === 'profile' ? 'bg-fuwoo-primary/10 text-fuwoo-primary border-r-4 border-fuwoo-primary' : ''
            }`}
          >
            <User className="w-5 h-5" />
            Mon profil
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition ${
              activeTab === 'settings' ? 'bg-fuwoo-primary/10 text-fuwoo-primary border-r-4 border-fuwoo-primary' : ''
            }`}
          >
            <Settings className="w-5 h-5" />
            Paramètres
          </button>
        </nav>
        
        <div className="absolute bottom-0 w-full p-6">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition">
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bonjour, Alexandre!</h1>
          <p className="text-gray-600 mt-1">Voici un aperçu de votre activité</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Réservations actives</p>
                <p className="text-2xl font-bold mt-1">{stats.activeBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Services complétés</p>
                <p className="text-2xl font-bold mt-1">{stats.completedServices}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total dépensé</p>
                <p className="text-2xl font-bold mt-1">${stats.totalSpent}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prestataires favoris</p>
                <p className="text-2xl font-bold mt-1">{stats.savedProviders}</p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Mes réservations</h2>
                <button className="bg-fuwoo-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-fuwoo-primary/90 transition">
                  <Plus className="w-4 h-4" />
                  Nouvelle réservation
                </button>
              </div>
            </div>
            
            <div className="divide-y">
              {bookings.map(booking => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{booking.service}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {booking.provider}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.date).toLocaleDateString('fr-CA')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.time}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold">${booking.price}</p>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)} mt-2`}>
                        {getStatusIcon(booking.status)}
                        {getStatusText(booking.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    {booking.status === 'pending' && (
                      <>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Confirmer
                        </button>
                        <span className="text-gray-300">•</span>
                      </>
                    )}
                    {booking.status === 'completed' && (
                      <>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Laisser un avis
                        </button>
                        <span className="text-gray-300">•</span>
                      </>
                    )}
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Voir les détails
                    </button>
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <>
                        <span className="text-gray-300">•</span>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          Annuler
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard Prestataire
type ProviderBookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

type ProviderBooking = {
  id: number;
  client: string;
  service: string;
  date: string;
  time: string;
  status: ProviderBookingStatus;
  price: number;
  address: string;
};

const ProviderDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [stats, setStats] = useState({
    pendingBookings: 3,
    todayBookings: 2,
    monthlyRevenue: 3450,
    rating: 4.8,
    completionRate: 95
  });

  useEffect(() => {
    setBookings([
      {
        id: 1,
        client: "Alexandre Roy",
        service: "Plomberie - Réparation de fuite",
        date: "2024-04-15",
        time: "10:00",
        status: "pending",
        price: 150,
        address: "123 Rue Example, Montréal"
      },
      {
        id: 2,
        client: "Sophie Tremblay",
        service: "Installation robinet",
        date: "2024-04-15",
        time: "14:00",
        status: "confirmed",
        price: 200,
        address: "456 Avenue Test, Laval"
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar similar to client but with provider-specific options */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-fuwoo-primary">Fuwoo Pro</h2>
          <p className="text-sm text-gray-600 mt-1">Espace Prestataire</p>
        </div>
        
        <nav className="mt-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition ${
              activeTab === 'overview' ? 'bg-fuwoo-primary/10 text-fuwoo-primary border-r-4 border-fuwoo-primary' : ''
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition ${
              activeTab === 'bookings' ? 'bg-fuwoo-primary/10 text-fuwoo-primary border-r-4 border-fuwoo-primary' : ''
            }`}
          >
            <Calendar className="w-5 h-5" />
            Réservations
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition ${
              activeTab === 'services' ? 'bg-fuwoo-primary/10 text-fuwoo-primary border-r-4 border-fuwoo-primary' : ''
            }`}
          >
            <Settings className="w-5 h-5" />
            Mes services
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-gray-50 transition ${
              activeTab === 'earnings' ? 'bg-fuwoo-primary/10 text-fuwoo-primary border-r-4 border-fuwoo-primary' : ''
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Revenus
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'overview' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-600 mt-1">Gérez votre activité de prestataire</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">En attente</p>
                    <p className="text-2xl font-bold mt-1">{stats.pendingBookings}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Aujourd'hui</p>
                    <p className="text-2xl font-bold mt-1">{stats.todayBookings}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Revenus (mois)</p>
                    <p className="text-2xl font-bold mt-1">${stats.monthlyRevenue}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Note moyenne</p>
                    <p className="text-2xl font-bold mt-1">{stats.rating}/5</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taux réussite</p>
                    <p className="text-2xl font-bold mt-1">{stats.completionRate}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Réservations récentes</h2>
              </div>
              
              <div className="divide-y">
                {bookings.map(booking => (
                  <div key={booking.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{booking.service}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {booking.client}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(booking.date).toLocaleDateString('fr-CA')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{booking.address}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold">${booking.price}</p>
                        {booking.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition">
                              Accepter
                            </button>
                            <button className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition">
                              Refuser
                            </button>
                          </div>
                        )}
                        {booking.status === 'confirmed' && (
                          <span className="text-blue-600 text-sm">Confirmée</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Export both dashboards
export default function DashboardPage({ userRole = 'client' }) {
  return userRole === 'client' ? <ClientDashboard /> : <ProviderDashboard />;
}