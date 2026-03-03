import { useEffect } from "react";
import ServiceCard from "../components/ServiceCard";
import { Wrench, Sparkles, ShieldCheck, Truck } from "lucide-react";
import { useServices } from "../contexts/ServiceContext";

const fallbackServices = [
  {
    id: 1,
    icon: <Wrench />,
    title: "Plomberie",
    description: "Réparation, débouchage, installations sanitaires.",
  },
  {
    id: 2,
    icon: <Sparkles />,
    title: "Ménage",
    description: "Nettoyage résidentiel ou commercial, ponctuel ou régulier.",
  },
  {
    id: 3,
    icon: <ShieldCheck />,
    title: "Électricité",
    description: "Installation de luminaires, prises, panneaux électriques.",
  },
  {
    id: 4,
    icon: <Truck />,
    title: "Déménagement",
    description: "Transport, aide pour soulever, déménagement local.",
  },
];

const Services = () => {
  const { services, loading, fetchServices } = useServices();

  useEffect(() => {
    fetchServices();
  }, []);

  const hasApiServices = services.length > 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-fuwoo-primary">Nos Services</h1>
      <p className="mt-4 text-lg mb-8">
        Plomberie, électricité, déménagement, ménage et plus encore.
      </p>

      {loading && (
        <p className="text-gray-500 mb-4">Chargement des services...</p>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {hasApiServices
          ? services.map((s) => (
              <ServiceCard
                key={s.id}
                title={s.title}
                description={s.description}
                linkTo={`/service/${s.id}`}
              />
            ))
          : !loading &&
            fallbackServices.map((s) => (
              <ServiceCard
                key={s.id}
                icon={s.icon}
                title={s.title}
                description={s.description}
                linkTo={`/service/${s.id}`}
              />
            ))}
      </div>
    </div>
  );
};

export default Services;
