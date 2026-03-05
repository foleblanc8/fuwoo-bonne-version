// src/pages/VerifyEmail.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!uid || !token) { setStatus('error'); setMessage('Lien invalide.'); return; }
    axios.get(`auth/verify-email/?uid=${uid}&token=${token}`)
      .then(res => { setStatus('success'); setMessage((res.data as any).detail); })
      .catch(err => { setStatus('error'); setMessage(err?.response?.data?.detail || 'Lien invalide ou expiré.'); });
  }, []);

  return (
    <div className="p-8 max-w-md mx-auto text-center">
      {status === 'loading' && <p className="text-gray-500">Vérification en cours…</p>}
      {status === 'success' && (
        <>
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <p className="text-gray-900 font-semibold text-lg">Courriel vérifié !</p>
          <p className="text-gray-500 text-sm mt-1">{message}</p>
          <Link to="/dashboard" className="mt-5 inline-block bg-coupdemain-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-coupdemain-primary/90 transition text-sm">
            Aller au tableau de bord
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <p className="text-gray-700 font-semibold">{message}</p>
          <Link to="/dashboard" className="mt-4 inline-block text-coupdemain-primary hover:underline text-sm">
            Retour au tableau de bord
          </Link>
        </>
      )}
    </div>
  );
};

export default VerifyEmail;
