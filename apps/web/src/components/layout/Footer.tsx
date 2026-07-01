import { Instagram, Music2, Facebook } from 'lucide-react';
import { BRAND } from '@jaw/shared';
import type { LandingConfig } from '@jaw/shared';
import { Separator } from '../ui/separator';

interface SocialContent {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
}

interface FooterProps {
  landing?: LandingConfig[];
}

export function Footer({ landing }: FooterProps) {
  const social = landing?.find((s) => s.sectionKey === 'social')?.content as SocialContent | undefined;
  const links = [
    { key: 'instagram', label: 'Instagram', href: social?.instagram, Icon: Instagram },
    { key: 'tiktok', label: 'TikTok', href: social?.tiktok, Icon: Music2 },
    { key: 'facebook', label: 'Facebook', href: social?.facebook, Icon: Facebook },
  ].filter((l) => l.href);
  return (
    <footer className="border-t-2 border-border bg-surface-2">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
        <p className="font-display text-lg font-bold text-text">
          <span className="text-primary">J</span>
          <span className="text-accent">A</span>
          <span className="text-secondary">W</span>
          <span className="ml-1">Project</span>
        </p>
        {links.length > 0 && (
          <ul className="flex gap-3">
            {links.map(({ key, label, href, Icon }) => (
              <li key={key}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-11 place-items-center rounded-full border-2 border-border text-text-muted transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary">
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        )}
        <Separator className="max-w-xs" />
        <p className="text-xs text-text-muted">© {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
