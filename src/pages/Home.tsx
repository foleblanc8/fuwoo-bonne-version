// src/pages/Home.tsx
import { Link, useNavigate } from "react-router-dom";
import { Search, ShieldCheck, ArrowRight, MapPin, FileText, Bell, Star } from "lucide-react";
import { getCategoryImage } from "../data/serviceImages";

const popularCategories = [
  { slug: "menage-residentiel",  label: "Ménage résidentiel" },
  { slug: "plomberie",           label: "Plomberie" },
  { slug: "deneigement",         label: "Déneigement" },
  { slug: "tonte-pelouse",       label: "Tonte de pelouse" },
  { slug: "peinture",            label: "Peinture" },
  { slug: "electricite",         label: "Électricité" },
  { slug: "entretien-piscine",   label: "Entretien piscine" },
  { slug: "demenagement",        label: "Déménagement" },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <div
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-950/80 via-green-900/60 to-teal-900/50" />
        <div className="absolute top-16 right-1/4 w-72 h-72 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-48 bg-teal-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-green-100 mb-6">
            <MapPin className="w-3.5 h-3.5" />
            Services locaux au Québec
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Décrivez votre projet,
            <br />
            <span className="bg-gradient-to-r from-green-300 to-teal-300 bg-clip-text text-transparent">
              recevez des soumissions.
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg md:text-xl text-white/75 max-w-xl mx-auto">
            Des pros de votre région compétitionnent pour vous.
            Fini les appels un par un — comparez et choisissez.
          </p>

          {/* Search */}
          <div className="mt-8 sm:mt-10 max-w-xl mx-auto bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-2xl">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-3">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Quel service cherchez-vous ?"
                className="flex-1 text-gray-900 placeholder-gray-400 focus:outline-none text-sm bg-transparent"
                onKeyDown={e => { if (e.key === 'Enter') navigate('/services'); }}
              />
            </div>
            <Link
              to="/services"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-5 py-3 rounded-xl font-semibold text-sm hover:from-green-600 hover:to-teal-600 transition-all shadow-sm"
            >
              Trouver un pro
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-8 sm:mt-10 flex items-center justify-center gap-4 sm:gap-8 text-sm text-white/60">
            <span><strong className="text-white font-semibold">500+</strong> prestataires</span>
            <span className="text-white/30">•</span>
            <span><strong className="text-white font-semibold">100%</strong> gratuit pour les clients</span>
            <span className="text-white/30">•</span>
            <span><strong className="text-white font-semibold">2 min</strong> pour soumettre</span>
          </div>
        </div>
      </div>

      {/* ── Comment ça marche ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Comment ça marche</h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Simple, rapide, gratuit pour les clients.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              emoji: "📋",
              step: "1",
              title: "Décrivez votre projet",
              desc: "Choisissez une catégorie, décrivez le travail et ajoutez des photos. Ça prend 2 minutes.",
            },
            {
              emoji: "📬",
              step: "2",
              title: "Recevez des soumissions",
              desc: "Les prestataires de votre région reçoivent une notification et vous font une offre.",
            },
            {
              emoji: "✅",
              step: "3",
              title: "Choisissez la meilleure",
              desc: "Comparez les offres, lisez les avis et acceptez celle qui vous convient.",
            },
          ].map(item => (
            <div key={item.step} className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl">
                  {item.emoji}
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-coupdemain-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.step}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 text-base">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-coupdemain-primary text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-coupdemain-primary/90 transition-all shadow-sm text-sm"
          >
            Faire une demande gratuitement
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Catégories populaires ── */}
      <div className="bg-gray-50 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nos services</h2>
              <p className="text-gray-500 text-sm mt-0.5">Cliquez pour demander une soumission gratuite</p>
            </div>
            <Link
              to="/services"
              className="flex items-center gap-1.5 text-coupdemain-primary text-sm font-semibold hover:gap-2.5 transition-all"
            >
              Voir tous les services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {popularCategories.map(cat => (
              <Link
                key={cat.slug}
                to="/services"
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={getCategoryImage(cat.slug)}
                    alt={cat.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <p className="font-semibold text-gray-900 text-sm leading-snug">{cat.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pourquoi Coupdemain ── */}
      <div className="relative bg-gradient-to-br from-green-950 via-green-900 to-teal-900 py-16 sm:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-green-200 mb-5">
            ✦ Pourquoi Coupdemain
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            La compétition au service
            <br />
            <span className="text-green-300">de vos travaux</span>
          </h2>
          <p className="text-green-200/70 mb-12 max-w-lg mx-auto text-sm sm:text-base">
            Fini de chercher un pro pendant des heures. Décrivez votre besoin une seule fois et laissez les prestataires venir à vous.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <ShieldCheck className="w-6 h-6 text-white" />,
                title: "Prestataires vérifiés",
                desc: "Identité validée, avis authentiques. Vous savez avec qui vous faites affaire.",
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: <Bell className="w-6 h-6 text-white" />,
                title: "Soumissions rapides",
                desc: "Les pros de votre région sont notifiés en temps réel et répondent en quelques heures.",
                gradient: "from-teal-500 to-cyan-500",
              },
              {
                icon: <Star className="w-6 h-6 text-white fill-white" />,
                title: "Zéro appel à froid",
                desc: "Plus besoin d'appeler 10 entreprises. Comparez les offres depuis votre tableau de bord.",
                gradient: "from-emerald-500 to-teal-500",
              },
            ].map(item => (
              <div
                key={item.title}
                className="flex flex-col items-center gap-4 p-6 sm:p-7 bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/12 transition-colors group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-white text-base sm:text-lg">{item.title}</h3>
                <p className="text-green-200/70 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Double CTA — client + prestataire */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-green-800 font-semibold px-7 py-3.5 rounded-xl shadow-lg hover:bg-green-50 transition-all text-sm"
            >
              <FileText className="w-4 h-4" />
              Je cherche un pro
            </Link>
            <Link
              to="/inscription"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/25 text-white font-medium px-7 py-3.5 rounded-xl hover:bg-white/10 transition-all text-sm"
            >
              Je suis prestataire
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
