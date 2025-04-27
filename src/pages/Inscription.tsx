// src/pages/Inscription.tsx
// src/pages/Inscription.tsx

import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebookF } from "react-icons/fa";

const Inscription = () => {
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center text-fuwoo-primary">
        Créer un compte Fuwoo
      </h1>
      <p className="text-center text-gray-600 mt-2">
        Rejoignez la communauté Fuwoo dès aujourd'hui.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <button className="flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 py-3 rounded-xl shadow hover:shadow-md transition">
          <FcGoogle size={24} />
          Continuer avec Google
        </button>
        <button className="flex items-center justify-center gap-3 bg-black text-white py-3 rounded-xl shadow hover:shadow-md transition">
          <FaApple size={24} />
          Continuer avec Apple
        </button>
        <button className="flex items-center justify-center gap-3 bg-blue-600 text-white py-3 rounded-xl shadow hover:shadow-md transition">
          <FaFacebookF size={24} />
          Continuer avec Facebook
        </button>
      </div>

      <div className="flex items-center my-6">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="px-3 text-gray-500 text-sm">ou</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>

      <form className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Prénom"
          className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fuwoo-primary"
        />
        <input
          type="email"
          placeholder="Adresse courriel"
          className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fuwoo-primary"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fuwoo-primary"
        />

        <button
          type="submit"
          className="mt-6 bg-fuwoo-primary text-white py-3 rounded-xl shadow hover:shadow-md transition"
        >
          Créer mon compte
        </button>
      </form>
    </div>
  );
};

export default Inscription;
