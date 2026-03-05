// src/pages/ResetPassword.tsx
import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!uid || !token) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <p className="text-gray-700 font-semibold">Lien invalide</p>
        <p className="text-gray-400 text-sm mt-1">Ce lien de réinitialisation est invalide ou a expiré.</p>
        <Link to="/mot-de-passe-oublie" className="mt-4 inline-block text-coupdemain-primary hover:underline text-sm">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('auth/password-reset-confirm/', { uid, token, password });
      setSuccess(true);
      setTimeout(() => navigate('/connexion'), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Lien invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl">✓</span>
        </div>
        <p className="text-gray-900 font-semibold">Mot de passe modifié !</p>
        <p className="text-gray-500 text-sm mt-1">Redirection vers la connexion…</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-coupdemain-primary text-center">Nouveau mot de passe</h1>
      <p className="text-center text-gray-600 mt-2">Choisissez un nouveau mot de passe pour votre compte.</p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nouveau mot de passe (min. 8 caractères)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={8}
          className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={passwordConfirm}
          onChange={e => setPasswordConfirm(e.target.value)}
          required
          className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-coupdemain-primary"
        />
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-coupdemain-primary text-white py-3 rounded-xl shadow hover:shadow-md transition disabled:opacity-60"
        >
          {loading ? 'Modification…' : 'Modifier le mot de passe'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
