// src/pages/MotDePasseOublie.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MotDePasseOublie = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('auth/password-reset/', { email });
      setSent(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-coupdemain-primary text-center">Mot de passe oublié</h1>
      <p className="text-center text-gray-600 mt-2">
        Entrez votre adresse courriel pour recevoir un lien de réinitialisation.
      </p>

      {sent ? (
        <div className="mt-8 p-5 bg-green-50 border border-green-200 rounded-xl text-center">
          <p className="text-green-800 font-medium">Lien envoyé !</p>
          <p className="text-sm text-green-700 mt-1">
            Si ce courriel est enregistré, vous recevrez un lien dans les prochaines minutes.
          </p>
          <p className="text-xs text-green-600 mt-3">
            (En développement, le lien s'affiche dans la console Django)
          </p>
        </div>
      ) : (
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Votre adresse courriel"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
          />
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-coupdemain-primary text-white py-3 rounded-xl shadow hover:shadow-md transition disabled:opacity-60"
          >
            {loading ? 'Envoi…' : 'Envoyer le lien'}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-gray-600 mt-6">
        <Link to="/connexion" className="text-coupdemain-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
};

export default MotDePasseOublie;
