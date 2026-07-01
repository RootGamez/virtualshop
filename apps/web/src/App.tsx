import { Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { useLenisScroll } from './hooks/useLenisScroll';
import { useLanding } from './hooks/useCatalogData';

export default function App() {
  useLenisScroll();
  const { data: landing } = useLanding();

  return (
    // reducedMotion="user": Motion respeta prefers-reduced-motion automáticamente
    // en toda la app (spec §3 y §12), sin tener que chequearlo componente por componente.
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/producto/:slug" element={<ProductDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer landing={landing} />
      </div>
    </MotionConfig>
  );
}
