import { SectionHeading } from '../ui/SectionHeading';

interface AboutContent {
  title?: string;
  body?: string;
}

export function AboutSection({ content }: { content?: AboutContent }) {
  if (!content?.body) return null;

  return (
    <section className="px-4 py-16 sm:px-6">
      <SectionHeading title={content.title || 'Sobre nosotros'} description={content.body} />
    </section>
  );
}
