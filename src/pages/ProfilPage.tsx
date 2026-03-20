// src/pages/ProfilPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProfilPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/dashboard', { replace: true, state: { tab: 'profile' } });
  }, [navigate]);
  return null;
};

export default ProfilPage;
