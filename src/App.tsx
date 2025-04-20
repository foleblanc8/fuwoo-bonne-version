import Layout from "./components/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import APropos from "./pages/APropos";
import { Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/a-propos" element={<APropos />} />
      </Routes>
    </Layout>
  );
};

export default App;