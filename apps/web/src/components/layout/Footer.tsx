import { Instagram, Music2, Facebook, MapPin, Clock, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BRAND } from '@jaw/shared';
import type { LandingConfig } from '@jaw/shared';

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
    <footer className="texture-grain relative border-t-4 border-lime bg-forest-deep text-bone">
      <div className="relative z-[2] mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3 sm:px-6">
        {/* Marca */}
        <div>
          <p className="font-display text-3xl font-bold uppercase text-lime">
            {BRAND.shortName}
            <span className="align-super text-xs">®</span>
          </p>
          <p className="mt-1 text-xs font-semibold lowercase tracking-[0.35em] text-bone/60">project</p>
          <p className="mt-4 max-w-xs text-sm text-bone/75">{BRAND.description}</p>
          {links.length > 0 && (
            <ul className="mt-5 flex gap-3">
              {links.map(({ key, label, href, Icon }) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-11 place-items-center rounded-full border-2 border-forest-line text-bone/70 transition-all hover:-translate-y-0.5 hover:border-lime hover:text-lime"
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tienda */}
        <nav aria-label="Enlaces de la tienda">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-sky">Tienda</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            <li><Link to="/" className="text-bone/80 transition-colors hover:text-lime">Inicio</Link></li>
            <li><Link to="/catalogo" className="text-bone/80 transition-colors hover:text-lime">Catálogo</Link></li>
            <li><Link to="/#como-funciona" className="text-bone/80 transition-colors hover:text-lime">Cómo pedir</Link></li>
            <li><Link to="/#preguntas" className="text-bone/80 transition-colors hover:text-lime">Preguntas frecuentes</Link></li>
          </ul>
        </nav>

        {/* Contacto / info operativa */}
        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-sky">La tienda</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-bone/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />
              {BRAND.location}
            </li>
            <li className="flex items-start gap-2">
              <Truck className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />
              {BRAND.shippingNote}
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-lime" aria-hidden="true" />
              {BRAND.schedule}
            </li>
          </ul>
        </div>
      </div>

      <div className="relative z-[2] border-t border-forest-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-bone/50 sm:px-6">
          © {new Date().getFullYear()} {BRAND.name}. Todos los derechos reservados · Hecho con flow en CCS.
        </p>
      </div>
    </footer>
  );
}
