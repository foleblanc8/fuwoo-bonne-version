// src/pages/Inscription.tsx

import { useState } from "react";
import SEO from "../components/SEO";
import { Link, useNavigate } from "react-router-dom";
import { Home, Wrench, Check, Leaf, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Inscription = () => {
  const [role, setRole] = useState<"client" | "prestataire">("client");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedCnesst, setAcceptedCnesst] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!acceptedTerms) {
      setError("Vous devez accepter les conditions d'utilisation pour continuer.");
      return;
    }

    if (role === 'prestataire' && !acceptedCnesst) {
      setError("Vous devez confirmer votre statut de travailleur autonome pour continuer.");
      return;
    }

    setLoading(true);
    try {
      await register({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone || undefined,
        role,
        terms_accepted: true,
      });
      navigate("/dashboard");
    } catch (err: any) {
      const data = err?.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(" ");
        setError(messages || "Erreur lors de l'inscription.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-400 transition bg-gray-50 focus:bg-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/60 via-white to-teal-50/40 py-10 px-4">
      <SEO
        title="Créer un compte"
        description="Rejoignez Coupdemain gratuitement. Trouvez des pros vérifiés ou offrez vos services au Québec."
        url="/inscription"
        noIndex
      />
      <div className="max-w-lg mx-auto">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center shadow-sm">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-extrabold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
            Coupdemain
          </span>
        </div>

        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1.5">
            Rejoignez Coupdemain — la marketplace de services à domicile au Québec.
          </p>
        </div>

        {/* Sélecteur de rôle */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 mb-3 text-center uppercase tracking-widest">
            Comment comptez-vous utiliser Coupdemain ?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Client */}
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                role === "client"
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-teal-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              {role === "client" && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
              )}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                role === "client"
                  ? "bg-gradient-to-br from-green-500 to-teal-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-400"
              }`}>
                <Home className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-sm">Trouver des services</p>
                <p className="text-xs text-gray-400 mt-0.5">Des pros pour votre maison</p>
              </div>
            </button>

            {/* Prestataire */}
            <button
              type="button"
              onClick={() => setRole("prestataire")}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                role === "prestataire"
                  ? "border-green-500 bg-gradient-to-br from-green-50 to-teal-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              {role === "prestataire" && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
              )}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                role === "prestataire"
                  ? "bg-gradient-to-br from-green-500 to-teal-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-400"
              }`}>
                <Wrench className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-sm">Offrir & trouver</p>
                <p className="text-xs text-gray-400 mt-0.5">Proposez vos services</p>
              </div>
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-2.5">
            {role === "prestataire"
              ? "Les deux modes sont disponibles depuis votre tableau de bord."
              : "Vous pourrez activer le mode prestataire à tout moment."}
          </p>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4"
        >
          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Prénom</label>
              <input
                type="text"
                placeholder="Marie"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom</label>
              <input
                type="text"
                placeholder="Tremblay"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom d'utilisateur</label>
            <input
              type="text"
              placeholder="marie_tremblay"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Adresse courriel</label>
            <input
              type="email"
              placeholder="marie@exemple.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Téléphone <span className="text-gray-300 font-normal">(optionnel)</span>
            </label>
            <input
              type="tel"
              placeholder="514 555-1234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Mot de passe</label>
              <input
                type="password"
                placeholder="Min. 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirmer</label>
              <input
                type="password"
                placeholder="Répétez"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Checkbox CNESST — prestataires seulement */}
          {role === 'prestataire' && (
            <label className="flex items-start gap-3 cursor-pointer bg-amber-50 border border-amber-200 rounded-xl p-3">
              <input
                type="checkbox"
                checked={acceptedCnesst}
                onChange={e => setAcceptedCnesst(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-amber-600 cursor-pointer shrink-0"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                Je comprends que j'exerce à titre de <strong>travailleur autonome indépendant</strong>.
                Je suis seul(e) responsable de ma couverture auprès de la <strong>CNESST</strong>,
                de mes assurances et du respect des règles de sécurité. Coupdemain n'est pas mon employeur.
              </span>
            </label>
          )}

          {/* Checkbox T&C */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-green-600 cursor-pointer shrink-0"
            />
            <span className="text-sm text-gray-600 leading-relaxed">
              J'ai lu et j'accepte les{" "}
              <Link to="/conditions-utilisation" target="_blank" className="text-emerald-600 hover:underline font-medium">
                Conditions d'utilisation
              </Link>{" "}
              et la{" "}
              <Link to="/politique-confidentialite" target="_blank" className="text-emerald-600 hover:underline font-medium">
                Politique de confidentialité
              </Link>
              .
            </span>
          </label>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              <span className="shrink-0 mt-0.5">⚠</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !acceptedTerms || (role === 'prestataire' && !acceptedCnesst)}
            className="mt-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-semibold text-sm shadow-sm hover:from-green-700 hover:to-teal-700 hover:shadow-md transition-all disabled:opacity-60"
          >
            {loading ? "Création en cours…" : (
              <>
                {role === "prestataire" ? "Créer mon compte prestataire" : "Créer mon compte"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Déjà un compte ?{" "}
          <Link to="/connexion" className="text-coupdemain-primary font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Inscription;
