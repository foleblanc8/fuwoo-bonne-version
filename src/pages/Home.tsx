// src/pages/Home.tsx
import { Link, useNavigate } from "react-router-dom";
import { Search, ShieldCheck, ArrowRight, MapPin, FileText, Bell, Star, BarChart2, Users, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { getCategoryImage } from "../data/serviceImages";
import { getCategoryStyle } from "../data/categoryStyles";
import { useState } from "react";
import SEO from "../components/SEO";

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

const testimonials = [
  {
    name: "Marie-Ève Tremblay",
    location: "Montréal",
    text: "J'ai reçu 4 soumissions en moins de 3 heures pour ma rénovation salle de bain. J'aurais jamais cru que ce serait aussi simple !",
    rating: 5,
    service: "Rénovation salle de bain",
  },
  {
    name: "Jean-Philippe Côté",
    location: "Québec",
    text: "Fini d'appeler des entrepreneurs qui ne rappellent jamais. Là ils viennent à moi avec leurs prix. Ça change tout.",
    rating: 5,
    service: "Déneigement",
  },
  {
    name: "Isabelle Lavoie",
    location: "Laval",
    text: "Le prestataire était vérifié, ponctuel et le prix était juste. Je recommande à toutes mes amies.",
    rating: 5,
    service: "Ménage résidentiel",
  },
];

const faqs = [
  {
    q: "Est-ce vraiment gratuit pour les clients ?",
    a: "Oui, à 100%. Poster une demande, recevoir des soumissions et choisir un prestataire ne vous coûte rien. Les prestataires paient une petite commission seulement lorsqu'une offre est acceptée.",
  },
  {
    q: "Comment les prestataires sont-ils vérifiés ?",
    a: "Chaque prestataire soumet une pièce d'identité que notre équipe valide manuellement. Une fois approuvé, il reçoit un badge « Vérifié » visible sur son profil. Les avis sont aussi vérifiés — seuls les clients ayant complété un service peuvent en laisser.",
  },
  {
    q: "En combien de temps reçoit-on des offres ?",
    a: "Généralement entre 2 et 24 heures. Les prestataires de votre région reçoivent une notification instantanée dès que vous publiez une demande.",
  },
  {
    q: "Que se passe-t-il si le prestataire ne se présente pas ?",
    a: "Le paiement est sécurisé via notre plateforme. Si le service n'est pas rendu, nous avons un processus de remboursement. Vous pouvez aussi laisser un avis qui aide toute la communauté.",
  },
  {
    q: "Je suis prestataire — comment ça fonctionne pour moi ?",
    a: "Vous créez un profil gratuit, activez les catégories de services que vous offrez, et recevez des notifications pour les nouvelles demandes dans votre région. Vous soumissionnez sur celles qui vous intéressent. Vous ne payez une commission que si votre offre est acceptée.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-white">
      <SEO url="/" />

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
            {popularCategories.map(cat => {
              const style = getCategoryStyle(cat.slug);
              const Icon = style.icon;
              return (
                <Link
                  key={cat.slug}
                  to="/services"
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-32 sm:h-36 overflow-hidden">
                    <img
                      src={getCategoryImage(cat.slug)}
                      alt={cat.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-70`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <Icon className="w-7 h-7 text-white drop-shadow-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="font-bold text-gray-900 text-sm leading-snug">{cat.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Témoignages ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Ce que disent nos clients</h2>
          <p className="text-gray-500 mt-2 text-sm">Des milliers de Québécois ont déjà fait confiance à Coupdemain.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div key={t.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed flex-1">"{t.text}"</p>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.location} · {t.service}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pour les prestataires ── */}
      <div className="bg-gray-50 py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-coupdemain-primary/10 text-coupdemain-primary rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                <Zap className="w-3.5 h-3.5" /> Pour les prestataires
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                Développez votre clientèle,
                <br />
                <span className="text-coupdemain-primary">gérez-la comme un pro.</span>
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                Coupdemain n'est pas juste un endroit pour trouver des clients — c'est votre outil de gestion. Suivez vos revenus, gardez un historique de chaque client, configurez des rappels de suivi. Tout ça dans un seul tableau de bord.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  { icon: <Bell className="w-4 h-4 text-coupdemain-primary" />, text: "Recevez des demandes dans votre rayon de service" },
                  { icon: <Users className="w-4 h-4 text-coupdemain-primary" />, text: "CRM intégré : fiches clients, pipeline, notes" },
                  { icon: <BarChart2 className="w-4 h-4 text-coupdemain-primary" />, text: "Tableau de bord revenus et statistiques" },
                  { icon: <ShieldCheck className="w-4 h-4 text-coupdemain-primary" />, text: "Badge vérifié pour inspirer confiance" },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-coupdemain-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <p className="text-sm text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
              <Link
                to="/inscription"
                className="inline-flex items-center gap-2 bg-coupdemain-primary text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-coupdemain-primary/90 transition shadow-sm"
              >
                Créer mon profil prestataire gratuitement
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Revenus suivis", value: "Mois par mois", icon: <BarChart2 className="w-7 h-7 text-emerald-500" />, bg: "bg-emerald-50" },
                { label: "Clients gérés", value: "Pipeline visuel", icon: <Users className="w-7 h-7 text-blue-500" />, bg: "bg-blue-50" },
                { label: "Rappels auto", value: "Ne perdez rien", icon: <Bell className="w-7 h-7 text-amber-500" />, bg: "bg-amber-50" },
                { label: "Zéro abonnement", value: "Payez seulement si ça marche", icon: <Zap className="w-7 h-7 text-purple-500" />, bg: "bg-purple-50" },
              ].map(card => (
                <div key={card.label} className={`${card.bg} rounded-2xl p-5 flex flex-col gap-3`}>
                  {card.icon}
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{card.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>
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
      {/* ── FAQ ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Questions fréquentes</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-gray-900 text-sm pr-4">{faq.q}</span>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                }
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA final ── */}
      <div className="bg-gradient-to-r from-coupdemain-primary to-emerald-600 py-14 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Prêt à recevoir vos premières soumissions ?</h2>
          <p className="text-white/80 mb-8 text-sm sm:text-base">Publiez votre demande en 2 minutes. C'est gratuit.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-coupdemain-primary font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-white/95 transition text-sm"
            >
              <FileText className="w-4 h-4" />
              Publier une demande gratuitement
            </Link>
            <Link
              to="/inscription"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/40 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/10 transition text-sm"
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
