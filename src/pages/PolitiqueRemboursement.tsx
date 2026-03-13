// src/pages/PolitiqueRemboursement.tsx
const PolitiqueRemboursement = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique d'annulation et de remboursement</h1>
      <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : mars 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Annulation par le Client</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          En cas d'annulation par le Client, des <strong>frais de gestion de 12 %</strong> sont
          retenus sur le montant total de la réservation et partagés à parts égales entre
          Coupdemain (6 %) et le Prestataire (6 %), à titre de compensation pour le temps
          réservé. Le remboursement accordé au Client varie ensuite selon le délai d'annulation :
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 border-b">Délai avant la prestation</th>
                <th className="px-4 py-3 border-b">Remboursement au Client</th>
                <th className="px-4 py-3 border-b">Répartition des sommes retenues</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b">
                <td className="px-4 py-3">Plus de 48 heures</td>
                <td className="px-4 py-3 text-emerald-600 font-medium">88 % remboursé</td>
                <td className="px-4 py-3">6 % Coupdemain + 6 % Prestataire</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="px-4 py-3">Entre 24 et 48 heures</td>
                <td className="px-4 py-3 text-yellow-600 font-medium">63 % remboursé</td>
                <td className="px-4 py-3">6 % Coupdemain + 6 % Prestataire + 25 % Prestataire</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Moins de 24 heures</td>
                <td className="px-4 py-3 text-red-500 font-medium">38 % remboursé</td>
                <td className="px-4 py-3">6 % Coupdemain + 6 % Prestataire + 50 % Prestataire</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-600 leading-relaxed text-sm">
          Les délais sont calculés à partir de l'heure de début prévue de la prestation.
          L'annulation doit être effectuée directement via la Plateforme.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Annulation par le Prestataire</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          Si un Prestataire annule une réservation confirmée, le Client recevra un{" "}
          <strong>remboursement intégral</strong> (100 %) dans un délai de 5 à 10 jours
          ouvrables selon le mode de paiement utilisé.
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          Des <strong>frais de gestion de 12 %</strong> seront prélevés directement sur le
          prochain versement du Prestataire à titre de compensation pour les inconvénients causés
          au Client et à la Plateforme.
        </p>
        <p className="text-gray-600 leading-relaxed text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <strong>Récidive :</strong> Les Prestataires qui annulent de façon répétée ou à court
          préavis sans motif valable s'exposent à une augmentation des frais de gestion, à une
          suspension ou à une résiliation définitive de leur compte.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Prestation non rendue ou non conforme</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          Si un Prestataire ne se présente pas ou si la prestation est manifestement non conforme
          à la description publiée, le Client peut ouvrir un litige dans les <strong>48 heures</strong>{" "}
          suivant l'heure de fin prévue via la Plateforme. Coupdemain étudiera le cas et pourra
          accorder un remboursement partiel ou total à sa seule discrétion.
        </p>
        <p className="text-gray-600 leading-relaxed text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <strong>Important :</strong> Coupdemain n'est pas responsable de la qualité des
          prestations. Le remboursement accordé dans ce cadre est un geste commercial et ne
          constitue pas une reconnaissance de responsabilité de la part de Coupdemain.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Modalités de remboursement</h2>
        <p className="text-gray-600 leading-relaxed">
          Les remboursements sont effectués via le même mode de paiement que celui utilisé lors
          de la réservation. Les délais varient selon les institutions financières (généralement
          3 à 10 jours ouvrables). Coupdemain ne peut être tenu responsable des délais imposés
          par les établissements bancaires.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Contact</h2>
        <p className="text-gray-600 leading-relaxed">
          Pour toute demande de remboursement ou litige, contactez notre équipe à :{" "}
          <a href="mailto:support@coupdemain.ca" className="text-emerald-600 hover:underline">
            support@coupdemain.ca
          </a>
        </p>
      </section>
    </div>
  );
};

export default PolitiqueRemboursement;
