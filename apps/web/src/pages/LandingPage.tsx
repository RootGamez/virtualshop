import { Hero } from '../components/landing/Hero';
import { StatsSection } from '../components/landing/StatsSection';
import { AboutSection } from '../components/landing/AboutSection';
import { CategoriesSection } from '../components/landing/CategoriesSection';
import { ImportSection } from '../components/landing/ImportSection';
import { ScrollShowcase } from '../components/landing/ScrollShowcase';
import { FaqSection } from '../components/landing/FaqSection';
import { CtaSection } from '../components/landing/CtaSection';
import { FeaturedCarousel } from '../components/catalog/FeaturedCarousel';
import { useLanding, useProducts, useCategories } from '../hooks/useCatalogData';
import { usePageMeta } from '../lib/seo';
import { BRAND } from '@jaw/shared';

export function LandingPage() {
  usePageMeta('Inicio', BRAND.description);
  const { data: landing } = useLanding();
  const { data: featured } = useProducts({ page: 1 });
  const { data: categories } = useCategories();

  const heroContent = landing?.find((s) => s.sectionKey === 'hero')?.content as
    | { title?: string; subtitle?: string; ctaLabel?: string }
    | undefined;
  const aboutContent = landing?.find((s) => s.sectionKey === 'about')?.content as
    | { title?: string; body?: string }
    | undefined;

  return (
    <>
      <Hero content={heroContent} />
      <StatsSection />
      <CategoriesSection categories={categories} />
      <FeaturedCarousel products={featured?.items.slice(0, 8)} />
      {/* Lookbook con motion scrolling — las imágenes se añaden en ScrollShowcase.FRAMES */}
      <ScrollShowcase />
      <ImportSection />
      <AboutSection content={aboutContent} />
      <FaqSection />
      <CtaSection />
    </>
  );
}
