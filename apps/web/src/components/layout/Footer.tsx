import { BRAND } from '@virtualshop/shared';
import type { LandingConfig } from '@virtualshop/shared';

interface SocialContent {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
}

interface FooterProps {
  landing?: LandingConfig[];
}

export function Footer({ landing }: FooterProps) {
  const social = landing?.find((s) => s.sectionKey === 'social')?.content as
    | SocialContent
    | undefined;

  const links = [
    { key: 'instagram', label: 'Instagram', href: social?.instagram },
    { key: 'tiktok', label: 'TikTok', href: social?.tiktok },
    { key: 'facebook', label: 'Facebook', href: social?.facebook },
  ].filter((l) => l.href);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6">
        <p className="text-sm font-semibold text-text">{BRAND.name}</p>
        {links.length > 0 && (
          <ul className="flex gap-4">
            {links.map((link) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-muted transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
