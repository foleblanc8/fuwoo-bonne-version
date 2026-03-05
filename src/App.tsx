// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import APropos from "./pages/APropos";
import Connexion from "./pages/connexion";
import Inscription from "./pages/Inscription";
import ProfilPage from "./pages/ProfilPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import DashboardPage from "./pages/DashboardPage";
import ProviderProfilePage from "./pages/ProviderProfilePage";
import MotDePasseOublie from "./pages/MotDePasseOublie";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/profil" element={<ProfilPage />} />
        <Route path="/service/:id" element={<ServiceDetailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/provider/:id" element={<ProviderProfilePage />} />
        <Route path="/mot-de-passe-oublie" element={<MotDePasseOublie />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </Layout>
  );
};

export default App;
