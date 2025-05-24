// src/pages/Inscription.tsx

import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebookF } from "react-icons/fa";

const Inscription = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        setSuccess(true);
        // Rediriger ou afficher un message si nécessaire
      } else {
        setError("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

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

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Prénom"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fuwoo-primary"
        />
        <input
          type="email"
          placeholder="Adresse courriel"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fuwoo-primary"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-fuwoo-primary"
        />

        <button
          type="submit"
          className="mt-6 bg-fuwoo-primary text-white py-3 rounded-xl shadow hover:shadow-md transition"
        >
          Créer mon compte
        </button>
      </form>

      {success && (
        <p className="text-green-600 mt-4 text-center">
          Inscription réussie! 🎉
        </p>
      )}
      {error && (
        <p className="text-red-600 mt-4 text-center">{error}</p>
      )}
    </div>
  );
};

export default Inscription;
