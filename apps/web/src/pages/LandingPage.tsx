import { Hero } from '../components/landing/Hero';
import { AboutSection } from '../components/landing/AboutSection';
import { FeaturedCarousel } from '../components/catalog/FeaturedCarousel';
import { useLanding, useProducts } from '../hooks/useCatalogData';
import { usePageMeta } from '../lib/seo';
import { BRAND } from '@virtualshop/shared';

export function LandingPage() {
  usePageMeta('Inicio', BRAND.tagline);
  const { data: landing } = useLanding();
  const { data: featured } = useProducts({ page: 1 });

  const heroContent = landing?.find((s) => s.sectionKey === 'hero')?.content as
    | { title?: string; subtitle?: string; ctaLabel?: string }
    | undefined;
  const aboutContent = landing?.find((s) => s.sectionKey === 'about')?.content as
    | { title?: string; body?: string }
    | undefined;

  return (
    <>
      <Hero content={heroContent} />
      <FeaturedCarousel products={featured?.items.slice(0, 8)} />
      <AboutSection content={aboutContent} />
    </>
  );
}
