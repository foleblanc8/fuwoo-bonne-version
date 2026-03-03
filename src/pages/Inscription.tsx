// src/pages/Inscription.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Wrench, Check } from "lucide-react";
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
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
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
    "w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary bg-white";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-coupdemain-primary">Créer un compte</h1>
          <p className="text-gray-500 mt-2">
            Rejoignez Coupdemain — la marketplace de services à domicile au Québec.
          </p>
        </div>

        {/* Sélecteur de rôle */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3 text-center uppercase tracking-wide">
            Je veux…
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Client */}
            <button
              type="button"
              onClick={() => setRole("client")}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                role === "client"
                  ? "border-coupdemain-primary bg-coupdemain-primary/5 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {role === "client" && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-coupdemain-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
              )}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  role === "client" ? "bg-coupdemain-primary text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                <Home className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800">Demander un service</p>
                <p className="text-xs text-gray-500 mt-1">
                  Trouvez des pros pour votre maison
                </p>
              </div>
            </button>

            {/* Prestataire */}
            <button
              type="button"
              onClick={() => setRole("prestataire")}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                role === "prestataire"
                  ? "border-coupdemain-primary bg-coupdemain-primary/5 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {role === "prestataire" && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-coupdemain-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
              )}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  role === "prestataire" ? "bg-coupdemain-primary text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                <Wrench className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800">Offrir un service</p>
                <p className="text-xs text-gray-500 mt-1">
                  Proposez vos compétences et gagnez
                </p>
              </div>
            </button>
          </div>

          {/* Badge contextuel */}
          <p className="text-center text-xs text-gray-400 mt-3">
            {role === "client"
              ? "Comme commander sur Uber Eats, mais pour les services à domicile."
              : "Comme être chauffeur Uber — vous choisissez vos horaires et tarifs."}
          </p>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4"
        >
          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prénom</label>
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
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

          {/* Nom d'utilisateur */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              placeholder="marie_tremblay"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {/* Courriel */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Adresse courriel
            </label>
            <input
              type="email"
              placeholder="marie@exemple.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Numéro de téléphone
              <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
            </label>
            <input
              type="tel"
              placeholder="514 555-1234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mot de passe</label>
            <input
              type="password"
              placeholder="Minimum 8 caractères"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={inputClass}
            />
          </div>

          {/* Confirmation */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              placeholder="Répétez votre mot de passe"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 bg-coupdemain-primary text-white py-3 rounded-xl font-semibold shadow hover:shadow-md transition disabled:opacity-60"
          >
            {loading
              ? "Création en cours..."
              : role === "prestataire"
              ? "Créer mon compte prestataire"
              : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{" "}
          <Link to="/connexion" className="text-coupdemain-primary hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Inscription;
