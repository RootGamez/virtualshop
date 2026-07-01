import { Hero } from '../components/landing/Hero';
import { AboutSection } from '../components/landing/AboutSection';
import { CategoriesSection } from '../components/landing/CategoriesSection';
import { ImportSection } from '../components/landing/ImportSection';
import { CtaSection } from '../components/landing/CtaSection';
import { FeaturedCarousel } from '../components/catalog/FeaturedCarousel';
import { useLanding, useProducts, useCategories } from '../hooks/useCatalogData';
import { usePageMeta } from '../lib/seo';
import { BRAND } from '@jaw/shared';

export function LandingPage() {
  usePageMeta('Inicio', BRAND.tagline);
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
      <CategoriesSection categories={categories} />
      <FeaturedCarousel products={featured?.items.slice(0, 8)} />
      <ImportSection />
      <AboutSection content={aboutContent} />
      <CtaSection />
    </>
  );
}
