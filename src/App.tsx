// src/App.tsx
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import APropos from "./pages/APropos";
import Connexion from "./pages/connexion"; // AJOUT
import Inscription from "./pages/Inscription"; // AJOUT
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="/connexion" element={<Connexion />} /> {/* NOUVELLE ROUTE */}
        <Route path="/inscription" element={<Inscription />} /> {/* NOUVELLE ROUTE */}
      </Routes>
    </Layout>
  );
};

export default App;
