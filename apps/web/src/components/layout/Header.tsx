import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { BRAND } from '@jaw/shared';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '../ui/sheet';
import { cn } from '../../lib/utils';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo', end: false },
];

function navClass(isActive: boolean) {
  return cn(
    'font-display text-sm font-bold uppercase tracking-wide transition-colors',
    isActive ? 'text-lime' : 'text-bone hover:text-lime'
  );
}

function Wordmark() {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className="font-display text-2xl font-bold uppercase leading-none text-lime">
        {BRAND.shortName}
        <span className="align-super text-[0.5rem]">®</span>
      </span>
      <span className="text-xs font-semibold lowercase tracking-[0.35em] text-bone/70">project</span>
    </span>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b-2 border-forest-line bg-forest/90 backdrop-blur">
      <nav aria-label="Principal" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" aria-label={`${BRAND.name} — inicio`}>
          <Wordmark />
        </Link>
        <ul className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end} className={({ isActive }) => navClass(isActive)}>{link.label}</NavLink>
            </li>
          ))}
          <li>
            <Button asChild size="sm" variant="accent">
              <Link to="/catalogo">Comprar ya</Link>
            </Button>
          </li>
        </ul>
        <div className="sm:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú" className="text-bone hover:bg-forest-mid">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent className="border-forest-line bg-forest text-bone">
              <SheetTitle className="text-bone">Menú</SheetTitle>
              <ul className="flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.to}>
                    <SheetClose asChild>
                      <NavLink to={link.to} end={link.end} className={({ isActive }) => navClass(isActive)}>{link.label}</NavLink>
                    </SheetClose>
                  </li>
                ))}
              </ul>
              <SheetClose asChild>
                <Button asChild variant="accent" className="mt-auto">
                  <Link to="/catalogo">Comprar ya</Link>
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
