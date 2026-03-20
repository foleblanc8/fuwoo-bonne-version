// src/pages/PolitiqueConfidentialite.tsx
const PolitiqueConfidentialite = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
      <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : mars 2026</p>

      <p className="text-gray-600 leading-relaxed mb-8">
        Coupdemain s'engage à protéger vos renseignements personnels conformément à la{" "}
        <em>Loi sur la protection des renseignements personnels dans le secteur privé</em> (Loi 25,
        Québec) et à la <em>Loi sur la protection des renseignements personnels et les documents
        électroniques</em> (LPRPDE, fédérale).
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Renseignements collectés</h2>
        <p className="text-gray-600 leading-relaxed mb-3">Nous collectons les renseignements suivants :</p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li>Nom, prénom, adresse courriel, numéro de téléphone ;</li>
          <li>Adresse postale (pour la prestation de services) ;</li>
          <li>Informations de profil (photo, description, tarifs pour les Prestataires) ;</li>
          <li>Historique des réservations et évaluations ;</li>
          <li>Données de navigation (adresse IP, cookies, pages visitées) ;</li>
          <li>Informations de paiement (traitées de manière sécurisée via nos partenaires de paiement).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Finalités du traitement</h2>
        <p className="text-gray-600 leading-relaxed mb-3">Vos données sont utilisées pour :</p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li>Créer et gérer votre compte ;</li>
          <li>Faciliter la mise en relation et les réservations ;</li>
          <li>Traiter les paiements et envoyer les confirmations ;</li>
          <li>Améliorer la Plateforme et personnaliser votre expérience ;</li>
          <li>Vous envoyer des communications relatives à vos réservations ;</li>
          <li>Respecter nos obligations légales et prévenir la fraude.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Partage des renseignements</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          Nous ne vendons jamais vos renseignements personnels. Nous pouvons les partager avec :
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li>Les autres utilisateurs, dans le cadre strict de la réservation (ex. : le Prestataire reçoit l'adresse du Client pour effectuer la prestation) ;</li>
          <li>Nos prestataires de services techniques (hébergement, paiement, courriel) soumis à des obligations de confidentialité ;</li>
          <li>Les autorités compétentes, si requis par la loi.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Conservation des données</h2>
        <p className="text-gray-600 leading-relaxed">
          Vos données sont conservées le temps nécessaire à la fourniture du service et aux
          obligations légales applicables (généralement 7 ans pour les données financières,
          conformément à la législation fiscale québécoise). Les comptes inactifs depuis plus
          de 3 ans peuvent être supprimés après préavis.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Vos droits</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          Conformément à la Loi 25, vous avez le droit de :
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li>Accéder à vos renseignements personnels ;</li>
          <li>Corriger des informations inexactes ;</li>
          <li>Demander la suppression de vos données (sous réserve des obligations légales) ;</li>
          <li>Retirer votre consentement au traitement non essentiel ;</li>
          <li>Déposer une plainte auprès de la Commission d'accès à l'information du Québec (CAI).</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mt-3">
          Pour exercer ces droits, contactez :{" "}
          <a href="mailto:privacy@coupdemain.ca" className="text-emerald-600 hover:underline">
            privacy@coupdemain.ca
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Cookies et outils analytiques tiers</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          La Plateforme utilise des cookies essentiels au fonctionnement du service (authentification,
          session) et des outils analytiques pour améliorer l'expérience utilisateur.
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          Nous utilisons notamment <strong>Microsoft Clarity</strong> (Microsoft Corporation), un outil
          d'analyse comportementale qui enregistre des données de navigation anonymisées (mouvements de
          souris, clics, pages visitées, durée des sessions) afin d'améliorer l'ergonomie de la
          Plateforme. Microsoft Clarity peut stocker des données sur des serveurs situés hors du Canada.
          Pour en savoir plus :{" "}
          <a href="https://privacy.microsoft.com/fr-ca/privacystatement" target="_blank" rel="noopener noreferrer"
            className="text-emerald-600 hover:underline">
            Politique de confidentialité Microsoft
          </a>.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Vous pouvez désactiver les cookies non essentiels via les paramètres de votre navigateur.
          Cela peut affecter certaines fonctionnalités de la Plateforme.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Sécurité</h2>
        <p className="text-gray-600 leading-relaxed">
          Nous appliquons des mesures de sécurité techniques et organisationnelles appropriées
          pour protéger vos données contre tout accès non autorisé, divulgation ou destruction.
          Les mots de passe sont chiffrés et les transmissions sécurisées via HTTPS.
        </p>
      </section>
    </div>
  );
};

export default PolitiqueConfidentialite;
