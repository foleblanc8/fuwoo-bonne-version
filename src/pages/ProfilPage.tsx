// src/pages/ProfilPage.tsx

import { useEffect, useState } from "react";

type UserData = {
  id: number;
  username: string;
  email: string;
  role: string;
  phone_number: string;
  address: string;
};

const ProfilPage = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Non connecté. Veuillez vous connecter.");
      return;
    }

    fetch("http://localhost:8000/api/profile/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Token invalide ou expiré");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setError("Erreur lors du chargement du profil");
      });
  }, []);

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>

      {error && <p className="text-red-600">{error}</p>}

      {user && (
        <div className="space-y-2">
          <p><strong>Nom d’utilisateur :</strong> {user.username}</p>
          <p><strong>Courriel :</strong> {user.email}</p>
          <p><strong>Rôle :</strong> {user.role}</p>
          <p><strong>Téléphone :</strong> {user.phone_number || "Non précisé"}</p>
          <p><strong>Adresse :</strong> {user.address || "Non précisée"}</p>
        </div>
      )}
    </div>
  );
};

export default ProfilPage;
