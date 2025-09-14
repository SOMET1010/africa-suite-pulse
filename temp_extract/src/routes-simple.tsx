import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import AfricanIndex from "@/pages/AfricanIndex";
import NotFoundPage from "@/pages/NotFoundPage";
import AuthPage from "@/pages/AuthPage";
import AuthLanding from "@/pages/AuthLanding";
import AfricanAuthPage from "@/pages/AfricanAuthPage";
import AfricanAuthPageFixed from "@/pages/AfricanAuthPageFixed";
import SimpleAuthDemo from "@/pages/SimpleAuthDemo";
import AfricanDesignShowcasePage from "@/pages/AfricanDesignShowcasePage";
import RequireAuth from "@/core/auth/RequireAuth";
import HiddenFeaturesTestPage from '@/pages/HiddenFeaturesTestPage';
import AyaAIDemoPage from '@/pages/AyaAIDemoPage';
import FinTechTestPageSimple from '@/pages/FinTechTestPageSimple';

export function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth-landing" element={<AuthLanding />} />
      <Route path="/login" element={<SimpleAuthDemo />} />
      <Route path="/african-auth" element={<SimpleAuthDemo />} />
      <Route path="/auth-demo" element={<SimpleAuthDemo />} />
      
      {/* Routes de test publiques */}
      <Route path="/hidden-features-test" element={<HiddenFeaturesTestPage />} />
      <Route path="/aya-demo" element={<AyaAIDemoPage />} />
      <Route path="/fintech-test" element={<FinTechTestPageSimple />} />
      <Route path="/african-design-showcase" element={<AfricanDesignShowcasePage />} />

      {/* Routes protégées */}
      <Route path="/" element={<SimpleAuthDemo />} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/index" element={<RequireAuth><Index /></RequireAuth>} />
      <Route path="/african-index" element={<AfricanIndex />} />
      
      {/* Page 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

