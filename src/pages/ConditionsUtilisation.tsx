// src/pages/ConditionsUtilisation.tsx
const ConditionsUtilisation = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions générales d'utilisation</h1>
      <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : mars 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Nature de la plateforme</h2>
        <p className="text-gray-600 leading-relaxed">
          Coupdemain (ci-après « la Plateforme ») est un service de mise en relation entre des
          particuliers ou entreprises cherchant des services à domicile (ci-après « Clients ») et
          des prestataires indépendants (ci-après « Prestataires »). Coupdemain n'est en aucun cas
          employeur, mandataire ou représentant des Prestataires. La Plateforme agit exclusivement
          comme intermédiaire technique facilitant cette mise en relation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Responsabilité des Prestataires</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          Les Prestataires inscrits sur la Plateforme exercent leur activité de manière totalement
          indépendante. À ce titre :
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li>
            Tout accident, dommage corporel, matériel ou financier survenant lors ou à la suite
            d'une prestation est de la <strong>responsabilité exclusive du Prestataire</strong>.
          </li>
          <li>
            Le Prestataire est seul responsable de disposer des assurances, licences et
            certifications requises pour exercer son activité.
          </li>
          <li>
            Le Prestataire s'engage à respecter toutes les lois et réglementations applicables
            au Québec et au Canada dans le cadre de ses services.
          </li>
          <li>
            En cas de litige, de blessure, de perte ou de dommage causé par un Prestataire,
            Coupdemain ne pourra être tenu responsable à quelque titre que ce soit.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Limitation de responsabilité de Coupdemain</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          Dans les limites permises par la loi applicable, Coupdemain décline toute responsabilité pour :
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li>Les actes, omissions, erreurs ou négligences des Prestataires ;</li>
          <li>La qualité, la sécurité ou la légalité des services offerts ;</li>
          <li>Tout dommage direct, indirect, accessoire ou consécutif résultant de l'utilisation de la Plateforme ;</li>
          <li>Les interruptions, pannes ou indisponibilités temporaires de la Plateforme ;</li>
          <li>Les informations inexactes fournies par les Prestataires ou les Clients.</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mt-3">
          La responsabilité totale de Coupdemain, si elle devait être engagée, serait en tout état
          de cause limitée aux frais de service effectivement payés par l'utilisateur au cours des
          trois (3) derniers mois.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Obligations des Clients</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li>Fournir des informations exactes lors de l'inscription et des réservations ;</li>
          <li>Traiter les Prestataires avec respect et dignité ;</li>
          <li>S'assurer que le lieu d'intervention est sécuritaire et accessible ;</li>
          <li>Ne pas contourner la Plateforme pour effectuer des paiements directs aux Prestataires ;</li>
          <li>Ne pas utiliser la Plateforme à des fins frauduleuses ou illégales.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Obligations des Prestataires</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li>Détenir une assurance responsabilité civile professionnelle en vigueur ;</li>
          <li>Honorer les réservations confirmées, sauf cas de force majeure ;</li>
          <li>Déclarer leurs revenus conformément à la législation fiscale applicable ;</li>
          <li>Ne pas solliciter les Clients en dehors de la Plateforme pendant 12 mois suivant leur première mise en relation ;</li>
          <li>Signaler immédiatement tout incident survenu lors d'une prestation.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Propriété intellectuelle</h2>
        <p className="text-gray-600 leading-relaxed">
          L'ensemble des éléments constituant la Plateforme (marque, logo, textes, interfaces,
          code source) est la propriété exclusive de Coupdemain et est protégé par les lois
          canadiennes sur la propriété intellectuelle. Toute reproduction ou utilisation non
          autorisée est strictement interdite.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Résiliation de compte</h2>
        <p className="text-gray-600 leading-relaxed">
          Coupdemain se réserve le droit de suspendre ou résilier tout compte en cas de violation
          des présentes conditions, de comportement frauduleux, d'abus signalés ou de toute
          activité susceptible de nuire à la Plateforme ou à ses utilisateurs, et ce sans préavis
          ni indemnité.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Droit applicable et juridiction</h2>
        <p className="text-gray-600 leading-relaxed">
          Les présentes conditions sont régies par les lois de la province de Québec et les lois
          fédérales du Canada applicables. Tout litige sera soumis à la compétence exclusive des
          tribunaux compétents du Québec.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Modifications</h2>
        <p className="text-gray-600 leading-relaxed">
          Coupdemain se réserve le droit de modifier les présentes conditions à tout moment.
          Les utilisateurs seront informés par courriel ou par notification sur la Plateforme.
          La poursuite de l'utilisation de la Plateforme après modification vaut acceptation
          des nouvelles conditions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Contact</h2>
        <p className="text-gray-600 leading-relaxed">
          Pour toute question relative aux présentes conditions, contactez-nous à :{" "}
          <a href="mailto:legal@coupdemain.ca" className="text-emerald-600 hover:underline">
            legal@coupdemain.ca
          </a>
        </p>
      </section>
    </div>
  );
};

export default ConditionsUtilisation;
