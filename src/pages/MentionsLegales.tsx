// src/pages/MentionsLegales.tsx
const MentionsLegales = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentions légales</h1>
      <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : mars 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Éditeur de la Plateforme</h2>
        <div className="text-gray-600 leading-relaxed space-y-1">
          <p><strong>Dénomination :</strong> Coupdemain</p>
          <p><strong>Courriel :</strong>{" "}
            <a href="mailto:info@coupdemain.ca" className="text-emerald-600 hover:underline">
              info@coupdemain.ca
            </a>
          </p>
          <p><strong>Province :</strong> Québec, Canada</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Hébergement</h2>
        <p className="text-gray-600 leading-relaxed">
          La Plateforme est hébergée sur des serveurs sécurisés. Pour toute question relative
          à l'hébergement, contactez-nous à :{" "}
          <a href="mailto:info@coupdemain.ca" className="text-emerald-600 hover:underline">
            info@coupdemain.ca
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Propriété intellectuelle</h2>
        <p className="text-gray-600 leading-relaxed">
          L'ensemble des contenus présents sur la Plateforme Coupdemain (textes, images, logos,
          icônes, code source) sont protégés par les lois canadiennes sur le droit d'auteur et
          la propriété intellectuelle. Toute reproduction, distribution ou utilisation sans
          autorisation écrite préalable est strictement interdite.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Limitation de responsabilité</h2>
        <p className="text-gray-600 leading-relaxed">
          Coupdemain met tout en œuvre pour assurer l'exactitude et la mise à jour des informations
          publiées sur la Plateforme. Toutefois, Coupdemain ne peut garantir l'exactitude, la
          complétude ou l'actualité des informations diffusées. L'utilisation des informations
          et du contenu disponible sur la Plateforme se fait sous l'entière responsabilité de
          l'utilisateur.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Droit applicable</h2>
        <p className="text-gray-600 leading-relaxed">
          Les présentes mentions légales sont soumises au droit de la province de Québec et aux
          lois fédérales du Canada. En cas de litige, les tribunaux compétents du Québec seront
          seuls habilités à connaître du différend.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact</h2>
        <p className="text-gray-600 leading-relaxed">
          Pour toute question d'ordre légal, écrivez-nous à :{" "}
          <a href="mailto:legal@coupdemain.ca" className="text-emerald-600 hover:underline">
            legal@coupdemain.ca
          </a>
        </p>
      </section>
    </div>
  );
};

export default MentionsLegales;
