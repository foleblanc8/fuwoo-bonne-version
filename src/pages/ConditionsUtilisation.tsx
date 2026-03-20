// src/pages/ConditionsUtilisation.tsx
import SEO from "../components/SEO";

const ConditionsUtilisation = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <SEO title="Conditions d'utilisation" url="/conditions-utilisation" noIndex />
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

      <section className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Travaux réglementés et non réglementés — Avis important</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Au Québec, certains travaux de construction et de rénovation sont encadrés par la{" "}
          <strong>Commission de la construction du Québec (CCQ)</strong> et la{" "}
          <strong>Régie du bâtiment du Québec (RBQ)</strong>. Coupdemain facilite la mise en relation pour
          une large gamme de services résidentiels, dont certains sont réglementés et d'autres non.
        </p>

        <h3 className="font-semibold text-gray-800 mb-2">Travaux soumis à une licence obligatoire (CCQ/RBQ)</h3>
        <p className="text-gray-600 leading-relaxed mb-2">
          Les travaux suivants nécessitent que le Prestataire détienne une <strong>licence RBQ valide</strong>{" "}
          et, selon le cas, soit accrédité auprès de la CCQ :
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1 leading-relaxed mb-4 text-sm">
          <li>Électricité (installation, modification de câblage, panneaux)</li>
          <li>Plomberie (installation de tuyauterie, raccordements sanitaires)</li>
          <li>Chauffage, ventilation et climatisation (CVAC) impliquant des réfrigérants</li>
          <li>Travaux de construction structuraux (fondations, charpente, agrandissements)</li>
          <li>Toiture neuve sur bâtiment de plus de 2 logements</li>
          <li>Gaz naturel et gaz propane</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mb-4 text-sm">
          Il est de la responsabilité du Client de vérifier que le Prestataire retenu détient les licences
          requises avant d'autoriser le début des travaux. La licence RBQ d'un entrepreneur peut être
          vérifiée gratuitement sur{" "}
          <a href="https://www.rbq.gouv.qc.ca/verifier-une-licence" target="_blank" rel="noopener noreferrer"
            className="text-emerald-700 hover:underline">rbq.gouv.qc.ca</a>.
        </p>

        <h3 className="font-semibold text-gray-800 mb-2">Travaux généralement non assujettis à la CCQ</h3>
        <p className="text-gray-600 leading-relaxed mb-2">
          Les services suivants sont généralement réalisables par des travailleurs autonomes ou des
          entreprises sans accréditation CCQ, sous réserve du respect des règlements municipaux et
          des normes de construction applicables :
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1 leading-relaxed mb-4 text-sm">
          <li>Ménage, nettoyage et entretien ménager</li>
          <li>Peinture intérieure et extérieure résidentielle</li>
          <li>Pose de planchers (bois, stratifié, vinyle, céramique)</li>
          <li>Menuiserie légère (portes, fenêtres, boiseries, armoires)</li>
          <li>Entretien et réparations mineures de toiture (bardeaux, solin, nettoyage)</li>
          <li>Clôtures, terrasses, pergolas et patios</li>
          <li>Calfeutrage, coupe-froid et isolation légère</li>
          <li>Déneigement, tonte de pelouse, aménagement paysager</li>
          <li>Déménagement, montage de meubles, réparations générales</li>
          <li>Nettoyage de gouttières, vitres, tapis et espaces extérieurs</li>
        </ul>
        <p className="text-gray-600 leading-relaxed text-sm">
          <strong>Même pour les travaux hors CCQ</strong>, le Prestataire doit respecter les codes et règlements
          municipaux applicables, ainsi que les normes du{" "}
          <em>Code national du bâtiment</em> et du <em>Code de construction du Québec</em> dans la mesure
          où ils s'appliquent. Coupdemain décline toute responsabilité en cas de non-conformité des
          travaux réalisés.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Statut des Prestataires — Travailleurs autonomes</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          Les Prestataires inscrits sur la Plateforme exercent leur activité à titre de{" "}
          <strong>travailleurs autonomes indépendants</strong>. Aucune relation d'emploi, de mandat
          ou de société n'existe entre Coupdemain et les Prestataires. À ce titre :
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li>
            Tout accident, dommage corporel, matériel ou financier survenant lors ou à la suite
            d'une prestation est de la <strong>responsabilité exclusive du Prestataire</strong>.
          </li>
          <li>
            Les Prestataires sont seuls responsables de leur couverture auprès de la{" "}
            <strong>Commission des normes, de l'équité, de la santé et de la sécurité du travail
            (CNESST)</strong>. Coupdemain ne souscrit aucune couverture CNESST pour les Prestataires
            et ne peut être tenu responsable d'un accident de travail survenu lors d'une prestation.
          </li>
          <li>
            Le Prestataire est seul responsable de disposer des assurances, licences et
            certifications requises pour exercer son activité. <strong>Coupdemain ne vérifie pas
            l'existence ni la validité de ces assurances</strong> et ne garantit pas que le Prestataire
            en détient effectivement. Il appartient au Client de valider ces informations avant
            d'autoriser le début des travaux.
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
        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Limitation de responsabilité de Coupdemain</h2>
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
        <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Obligations des Clients</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li>Fournir des informations exactes lors de l'inscription et des réservations ;</li>
          <li>Traiter les Prestataires avec respect et dignité ;</li>
          <li>S'assurer que le lieu d'intervention est sécuritaire et accessible ;</li>
          <li>Ne pas contourner la Plateforme pour effectuer des paiements directs aux Prestataires ;</li>
          <li>Ne pas utiliser la Plateforme à des fins frauduleuses ou illégales.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Âge minimum requis</h2>
        <p className="text-gray-600 leading-relaxed mb-3">
          L'utilisation de la Plateforme est autorisée dès l'âge de <strong>14 ans</strong>, sous réserve
          des conditions suivantes :
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li>
            Les utilisateurs de moins de 18 ans doivent avoir obtenu le{" "}
            <strong>consentement d'un parent ou tuteur légal</strong> avant de s'inscrire et d'utiliser
            la Plateforme, conformément au <em>Code civil du Québec</em>.
          </li>
          <li>
            Les Prestataires mineurs (14-17 ans) peuvent offrir des services de nature simple et
            non réglementée (ex. : tonte de pelouse, déneigement, ménage, livraison, gardiennage),
            sous la supervision et la responsabilité de leurs parents ou tuteurs légaux.
          </li>
          <li>
            Les travaux réglementés (électricité, plomberie, construction, etc.) sont réservés
            aux Prestataires majeurs (18 ans et plus) détenant les licences requises.
          </li>
          <li>
            Coupdemain se réserve le droit de demander une confirmation du consentement parental
            pour tout compte d'utilisateur mineur.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Obligations des Prestataires</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2 leading-relaxed">
          <li>Détenir une assurance responsabilité civile professionnelle en vigueur ;</li>
          <li>Honorer les réservations confirmées, sauf cas de force majeure ;</li>
          <li>Déclarer leurs revenus conformément à la législation fiscale applicable ;</li>
          <li>Ne pas solliciter les Clients en dehors de la Plateforme pendant 12 mois suivant leur première mise en relation ;</li>
          <li>Signaler immédiatement tout incident survenu lors d'une prestation.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Propriété intellectuelle</h2>
        <p className="text-gray-600 leading-relaxed">
          L'ensemble des éléments constituant la Plateforme (marque, logo, textes, interfaces,
          code source) est la propriété exclusive de Coupdemain et est protégé par les lois
          canadiennes sur la propriété intellectuelle. Toute reproduction ou utilisation non
          autorisée est strictement interdite.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Résiliation de compte</h2>
        <p className="text-gray-600 leading-relaxed">
          Coupdemain se réserve le droit de suspendre ou résilier tout compte en cas de violation
          des présentes conditions, de comportement frauduleux, d'abus signalés ou de toute
          activité susceptible de nuire à la Plateforme ou à ses utilisateurs, et ce sans préavis
          ni indemnité.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Droit applicable et juridiction</h2>
        <p className="text-gray-600 leading-relaxed">
          Les présentes conditions sont régies par les lois de la province de Québec et les lois
          fédérales du Canada applicables. Tout litige sera soumis à la compétence exclusive des
          tribunaux compétents du Québec.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">11. Modifications</h2>
        <p className="text-gray-600 leading-relaxed">
          Coupdemain se réserve le droit de modifier les présentes conditions à tout moment.
          Les utilisateurs seront informés par courriel ou par notification sur la Plateforme.
          La poursuite de l'utilisation de la Plateforme après modification vaut acceptation
          des nouvelles conditions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">12. Contact</h2>
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
