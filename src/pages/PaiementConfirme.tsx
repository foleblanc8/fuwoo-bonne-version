// src/pages/PaiementConfirme.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, MessageSquare, LayoutDashboard, FileText } from 'lucide-react';
import SEO from '../components/SEO';
import axios from 'axios';

export default function PaiementConfirme() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const bidId = params.get('bid');
  const [bid, setBid] = useState<any>(null);

  useEffect(() => {
    if (!bidId) return;
    axios.get(`bids/${bidId}/`).then(r => setBid(r.data)).catch(() => {});
  }, [bidId]);

  const provider = bid?.provider;
  const providerName = provider
    ? [provider.first_name, provider.last_name].filter(Boolean).join(' ') || provider.username
    : null;

  const handleContact = () => {
    if (provider?.id) {
      window.dispatchEvent(new CustomEvent('open-messages', { detail: { partnerId: provider.id } }));
      window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'messages' } }));
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <SEO title="Paiement confirmé" url="/paiement-confirme" noIndex />
      <div className="bg-white rounded-3xl shadow-lg max-w-md w-full p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement confirmé !</h1>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Votre paiement a été traité avec succès.{providerName ? ` ${providerName} a été notifié(e) et va vous contacter prochainement.` : ' Le prestataire a été notifié.'}
        </p>

        {bid && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Résumé de la commande</h2>
            {bid.service_request_detail?.title && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Service</span>
                <span className="font-medium text-gray-800 text-right max-w-[60%]">{bid.service_request_detail.title}</span>
              </div>
            )}
            {providerName && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Prestataire</span>
                <span className="font-medium text-gray-800">{providerName}</span>
              </div>
            )}
            {bid.price && (
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="text-gray-500">Montant payé</span>
                <span className="font-bold text-gray-900">${parseFloat(bid.price).toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {provider?.id && (
            <button
              onClick={handleContact}
              className="flex items-center justify-center gap-2 bg-coupdemain-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-coupdemain-primary/90 transition"
            >
              <MessageSquare className="w-5 h-5" />
              Envoyer un message au prestataire
            </button>
          )}
          {bidId && (
            <a
              href={`/api/contracts/${bidId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              <FileText className="w-5 h-5" />
              Télécharger le contrat PDF
            </a>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 px-6 py-3 rounded-xl font-medium transition"
          >
            <LayoutDashboard className="w-5 h-5" />
            Retour au tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
}
