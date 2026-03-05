// src/pages/APropos.tsx
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, Star, Clock, MapPin, Users, Home, Wrench, Heart } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const stats = [
  { value: "16+", label: "Services disponibles" },
  { value: "3", label: "Prestataires vérifiés" },
  { value: "4", label: "Régions du Québec" },
  { value: "4.8★", label: "Note moyenne" },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Confiance avant tout",
    description:
      "Chaque prestataire est identifié, évalué par la communauté et vérifié par notre équipe avant d'apparaître sur la plateforme.",
  },
  {
    icon: Star,
    title: "Qualité garantie",
    description:
      "Les avis sont 100 % authentiques — laissés uniquement par des clients ayant complété une réservation. Aucun faux avis.",
  },
  {
    icon: Clock,
    title: "Simplicité & rapidité",
    description:
      "Trouvez un pro, choisissez votre créneau et confirmez en moins de 2 minutes. Pas de téléphone, pas d'attente.",
  },
  {
    icon: Heart,
    title: "Fait au Québec",
    description:
      "Coupdemain est une entreprise québécoise qui croit au travail local. Chaque réservation soutient un professionnel de votre région.",
  },
];

const steps = [
  {
    num: "1",
    title: "Choisissez un service",
    description: "Parcourez nos catégories — ménage, plomberie, tonte, déneigement et plus encore.",
  },
  {
    num: "2",
    title: "Réservez en ligne",
    description: "Sélectionnez une date et un créneau. Confirmation immédiate ou sous 24 h.",
  },
  {
    num: "3",
    title: "Le pro arrive chez vous",
    description: "Votre prestataire vérifié se présente à l'heure convenue. Travail fait, vous payez.",
  },
];

const APropos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOffrirService = () => {
    if (user) {
      navigate('/dashboard', { state: { tab: 'services' } });
    } else {
      navigate('/inscription');
    }
  };

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <div
        className="relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-4xl mx-auto px-6 py-32 text-center text-white">
          <h1 className="text-5xl font-extrabold leading-tight drop-shadow">
            Des pros pour votre maison,<br />une plateforme pour le Québec.
          </h1>
          <p className="mt-6 text-xl text-white/85 max-w-2xl mx-auto">
            Coupdemain connecte les propriétaires québécois avec des prestataires de confiance
            pour tous leurs besoins à domicile.
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="bg-coupdemain-primary">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold">{s.value}</div>
              <div className="text-sm text-white/75 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Notre mission ── */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre mission</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Coupdemain est né d'un constat simple : trouver un bon professionnel pour sa maison au Québec
          est trop compliqué. Appels sans réponse, devis interminables, doutes sur la fiabilité…
          Nous avons créé une plateforme où réserver un service à domicile est aussi simple
          que commander une pizza — avec la confiance en plus.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed mt-4">
          Comme Airbnb l'a fait pour l'hébergement, Coupdemain révolutionne les services à domicile
          au Québec : transparence des prix, avis vérifiés, réservation en ligne et prestataires
          certifiés.
        </p>
      </div>

      {/* ── Comment ça marche ── */}
      <div className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-coupdemain-primary text-white text-2xl font-extrabold flex items-center justify-center mb-4 shadow-md">
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Nos valeurs ── */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nos valeurs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {values.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100"
            >
              <div className="w-12 h-12 bg-coupdemain-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-coupdemain-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pour qui ? ── */}
      <div className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Une plateforme pour tous
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Propriétaires</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Trouvez des pros de confiance pour votre maison. Comparez les prix,
                lisez les avis et réservez en ligne en quelques clics.
              </p>
              <Link
                to="/services"
                className="inline-block bg-coupdemain-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-coupdemain-primary/90 transition text-sm"
              >
                Trouver un service
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Prestataires</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Développez votre clientèle sans frais publicitaires. Gérez vos
                disponibilités, recevez des réservations et bâtissez votre réputation.
              </p>
              <button
                onClick={handleOffrirService}
                className="inline-block bg-green-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-600 transition text-sm"
              >
                Offrir un service
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Régions desservies ── */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Disponible partout au Québec</h2>
        <p className="text-gray-500 mb-8">
          Coupdemain est actif dans le Grand Montréal et s'étend rapidement à travers la province.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {["Montréal", "Laval", "Longueuil", "Rive-Sud", "Grand Montréal"].map((region) => (
            <span
              key={region}
              className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-full"
            >
              <MapPin className="w-3.5 h-3.5 text-coupdemain-primary" />
              {region}
            </span>
          ))}
        </div>
      </div>

      {/* ── CTA final ── */}
      <div className="bg-coupdemain-primary py-16">
        <div className="max-w-2xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Prêt à essayer Coupdemain ?</h2>
          <p className="text-white/80 mb-8 text-lg">
            Rejoignez des centaines de Québécois qui font confiance à Coupdemain pour leur maison.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="bg-white text-coupdemain-primary px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              Voir les services
            </Link>
            {user ? (
              <button
                onClick={handleOffrirService}
                className="bg-coupdemain-primary border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
              >
                Aller à mon tableau de bord
              </button>
            ) : (
              <Link
                to="/inscription"
                className="bg-coupdemain-primary border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
              >
                Créer un compte gratuit
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default APropos;
