import type { SVGProps } from 'react';

/*
 * Decoración de pintura/graffiti en SVG puro.
 * Color vía `currentColor`: pasar className="text-lime" / "text-sky" / "text-forest".
 * Todos son aria-hidden: son 100% decorativos.
 */

/** Mancha de pintura irregular con gotas satélite. */
export function PaintSplat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M100 18c14-6 32 0 36 14 16-2 30 12 26 27 14 8 14 30 1 38 8 14-2 32-18 33-1 16-20 26-34 18-10 12-31 10-38-4-16 4-31-11-27-26-14-7-16-28-4-37-9-13 0-32 15-35 2-15 20-24 33-18 3-7 6-8 10-10z" />
      <circle cx="178" cy="60" r="8" />
      <circle cx="186" cy="92" r="4" />
      <circle cx="22" cy="48" r="6" />
      <circle cx="14" cy="132" r="9" />
      <circle cx="170" cy="156" r="5" />
      <circle cx="60" cy="188" r="6" />
    </svg>
  );
}

/** Trazo de marcador con textura de spray. */
export function Scribble(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 300 60" fill="none" stroke="currentColor" aria-hidden="true" {...props}>
      <path d="M8 40C60 14 120 10 150 26s90 22 142-6" strokeWidth="10" strokeLinecap="round" />
      <path d="M20 52c50-18 110-14 130 0" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** Goteo de pintura para bordes de secciones (colocar absolute top-full). */
export function PaintDrips(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1200 60" preserveAspectRatio="none" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M0 0h1200v10c-30 0-38 34-58 34S1118 14 1096 14s-26 44-48 44-24-38-50-38-28 22-52 22-30-30-58-30-26 14-52 14-30-22-60-22-34 40-62 40-24-30-52-30-32 18-60 18-28-26-58-26-30 34-58 34-26-42-54-42-30 16-58 16-28 24-56 24-32-32-62-32-28 12-56 12-30 26-60 26-28-38-58-38-32 20-62 20V0z" />
    </svg>
  );
}

/** Nube de puntos de spray. */
export function SprayDots(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="currentColor" aria-hidden="true" {...props}>
      <circle cx="20" cy="30" r="3" />
      <circle cx="44" cy="18" r="2" />
      <circle cx="70" cy="30" r="4" />
      <circle cx="94" cy="20" r="2.5" />
      <circle cx="32" cy="58" r="2" />
      <circle cx="60" cy="50" r="3" />
      <circle cx="88" cy="56" r="2" />
      <circle cx="18" cy="86" r="2.5" />
      <circle cx="48" cy="80" r="4" />
      <circle cx="78" cy="88" r="2" />
      <circle cx="102" cy="78" r="3" />
      <circle cx="64" cy="106" r="2.5" />
    </svg>
  );
}
