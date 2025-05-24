// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import APropos from "./pages/APropos";
import Connexion from "./pages/connexion";
import Inscription from "./pages/Inscription";
import ProfilPage from "./pages/ProfilPage"; // <-- renommé pour éviter le bug

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/profil" element={<ProfilPage />} /> {/* Nouveau nom propre */}
      </Routes>
    </Layout>
  );
};

export default App;
