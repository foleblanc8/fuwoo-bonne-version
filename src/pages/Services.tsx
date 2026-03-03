// src/pages/Services.tsx
import { useEffect } from "react";
import ServiceCard from "../components/ServiceCard";
import { useServices } from "../contexts/ServiceContext";
import { Loader2 } from "lucide-react";

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
  const { services, loading, fetchServices } = useServices();

  useEffect(() => {
    fetchServices();
  }, []);

  const hasApiServices = services.length > 0;
  const displayed = hasApiServices ? services : fallbackServices;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900">Services à domicile</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Des professionnels vérifiés, partout au Québec.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-gray-400 py-12">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Chargement des services…</span>
          </div>
        )}

        {!loading && (
          <>
            <p className="text-sm text-gray-400 mb-6">
              {displayed.length} service{displayed.length > 1 ? "s" : ""} disponible{displayed.length > 1 ? "s" : ""}
            </p>

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
