// src/pages/Services.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import ServiceCard from "../components/ServiceCard";
import { ServiceCardSkeleton } from "../components/Skeleton";
import { useServices } from "../contexts/ServiceContext";
import { Search, SlidersHorizontal, X, MapPin, LocateFixed, Loader } from "lucide-react";

// Fallback si l'API est down
const fallbackServices = [
  { id: 1, title: "Plomberie résidentielle", categorySlug: "plomberie", serviceArea: "Montréal", price: "85", priceUnit: "par heure", rating: 4.9, totalBookings: 54 },
  { id: 2, title: "Ménage résidentiel", categorySlug: "menage-residentiel", serviceArea: "Laval", price: "65", priceUnit: "par visite", rating: 4.8, totalBookings: 98 },
  { id: 3, title: "Tonte de pelouse", categorySlug: "tonte-pelouse", serviceArea: "Longueuil", price: "55", priceUnit: "par visite", rating: 4.7, totalBookings: 72 },
  { id: 4, title: "Déneigement", categorySlug: "deneigement", serviceArea: "Rive-Sud", price: "45", priceUnit: "par visite", rating: 4.6, totalBookings: 88 },
  { id: 5, title: "Nettoyage de terrain", categorySlug: "nettoyage-terrain", serviceArea: "Grand Montréal", price: "75", priceUnit: "par visite", rating: 4.8, totalBookings: 29 },
  { id: 6, title: "Entretien de piscine", categorySlug: "entretien-piscine", serviceArea: "Rive-Sud", price: "180", priceUnit: "par visite", rating: 4.9, totalBookings: 18 },
];

const Services = () => {
  const { services, categories, loading, fetchServices, fetchCategories } = useServices();

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [city, setCity] = useState('');
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  const buildAndFetch = useCallback((
    s: string, cat: string, min: string, max: string,
    c: string, coords: { lat: number; lng: number } | null
  ) => {
    const filters: Record<string, string> = {};
    if (s) filters.search = s;
    if (cat) filters.category = cat;
    if (min) filters.min_price = min;
    if (max) filters.max_price = max;
    if (coords) {
      filters.lat = String(coords.lat);
      filters.lng = String(coords.lng);
    } else if (c) {
      filters.city = c;
    }
    fetchServices(Object.keys(filters).length ? filters : undefined);
  }, [fetchServices]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      buildAndFetch(val, selectedCat, minPrice, maxPrice, city, geoCoords);
    }, 300);
  };

  const handleFilterChange = (cat: string, min: string, max: string) => {
    setSelectedCat(cat);
    setMinPrice(min);
    setMaxPrice(max);
    buildAndFetch(search, cat, min, max, city, geoCoords);
  };

  const handleCityChange = (val: string) => {
    setCity(val);
    setGeoCoords(null);
    setGeoStatus('idle');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      buildAndFetch(search, selectedCat, minPrice, maxPrice, val, null);
    }, 300);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGeoCoords(coords);
        setCity('');
        setGeoStatus('success');
        buildAndFetch(search, selectedCat, minPrice, maxPrice, '', coords);
      },
      () => setGeoStatus('idle'),
      { timeout: 8000 }
    );
  };

  const handleReset = () => {
    setSearch('');
    setSelectedCat('');
    setMinPrice('');
    setMaxPrice('');
    setCity('');
    setGeoCoords(null);
    setGeoStatus('idle');
    fetchServices();
  };

  const hasFilters = search || selectedCat || minPrice || maxPrice || city || geoCoords;
  const hasApiServices = services.length > 0;
  const displayed = hasApiServices ? services : fallbackServices;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Services à domicile</h1>
          <p className="text-gray-500 mt-2 text-base sm:text-lg">Des professionnels vérifiés, partout au Québec.</p>

          {/* Barre de recherche */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un service…"
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coupdemain-primary text-sm"
              />
            </div>
            <div className="relative flex-1 sm:max-w-[220px]">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Ville ou région…"
                value={geoStatus === 'success' ? '' : city}
                onChange={e => handleCityChange(e.target.value)}
                disabled={geoStatus === 'success'}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coupdemain-primary text-sm disabled:bg-green-50 disabled:border-green-300 disabled:text-green-700 disabled:cursor-not-allowed"
              />
              {geoStatus === 'success' && (
                <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-green-700 font-medium pointer-events-none">
                  Position actuelle
                </span>
              )}
              <button
                type="button"
                onClick={geoStatus === 'success' ? handleReset : handleGeolocate}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-coupdemain-primary transition"
                title={geoStatus === 'success' ? 'Retirer la géolocalisation' : 'Utiliser ma position'}
              >
                {geoStatus === 'loading'
                  ? <Loader className="w-4 h-4 animate-spin text-coupdemain-primary" />
                  : geoStatus === 'success'
                  ? <X className="w-4 h-4 text-green-600" />
                  : <LocateFixed className="w-4 h-4" />
                }
              </button>
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition ${showFilters ? 'bg-coupdemain-primary text-white border-coupdemain-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-coupdemain-primary'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtres</span>
            </button>
            {hasFilters && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-500 hover:text-red-500 hover:border-red-300 transition"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Réinitialiser</span>
              </button>
            )}
          </div>

          {/* Panneau filtres */}
          {showFilters && (
            <div className="mt-3 grid grid-cols-1 sm:flex sm:flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              {/* Catégorie */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Catégorie</label>
                <select
                  value={selectedCat}
                  onChange={e => handleFilterChange(e.target.value, minPrice, maxPrice)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary w-full sm:min-w-[160px]"
                >
                  <option value="">Toutes</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Prix min */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Prix min ($)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={minPrice}
                  onChange={e => handleFilterChange(selectedCat, e.target.value, maxPrice)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-24 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
                />
              </div>

              {/* Prix max */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Prix max ($)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="∞"
                  value={maxPrice}
                  onChange={e => handleFilterChange(selectedCat, minPrice, e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-24 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => <ServiceCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && (
          <>
            <p className="text-sm text-gray-400 mb-6">
              {displayed.length} service{displayed.length > 1 ? "s" : ""} disponible{displayed.length > 1 ? "s" : ""}
              {hasFilters && !hasApiServices && ' (résultats API indisponibles — données exemple)'}
            </p>

            {displayed.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg font-medium">Aucun service trouvé</p>
                <p className="text-sm mt-1">Essayez d'ajuster vos filtres.</p>
              </div>
            )}

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {hasApiServices
                ? services.map((s) => (
                    <ServiceCard
                      key={s.id}
                      title={s.title}
                      categorySlug={s.category?.slug}
                      price={s.price}
                      priceUnit={s.price_unit}
                      rating={s.rating}
                      totalBookings={s.total_bookings}
                      serviceArea={s.service_area}
                      providerName={
                        s.provider?.first_name
                          ? `${s.provider.first_name} ${s.provider.last_name}`
                          : s.provider?.username
                      }
                      linkTo={`/service/${s.id}`}
                    />
                  ))
                : fallbackServices.map((s) => (
                    <ServiceCard
                      key={s.id}
                      title={s.title}
                      categorySlug={s.categorySlug}
                      price={s.price}
                      priceUnit={s.priceUnit}
                      rating={s.rating}
                      totalBookings={s.totalBookings}
                      serviceArea={s.serviceArea}
                      linkTo={`/service/${s.id}`}
                    />
                  ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Services;
