import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '../ui/sheet';
import { cn } from '../../lib/utils';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalogo', label: 'Catálogo', end: false },
];

function navClass(isActive: boolean) {
  return cn('font-display text-sm font-bold transition-colors', isActive ? 'text-primary' : 'text-text hover:text-primary');
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-bg/85 backdrop-blur">
      <nav aria-label="Principal" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-text">
          <span className="text-primary">J</span>
          <span className="text-accent">A</span>
          <span className="text-secondary">W</span>
          <span className="ml-1">Project</span>
        </Link>
        <ul className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end} className={({ isActive }) => navClass(isActive)}>{link.label}</NavLink>
            </li>
          ))}
          <li>
            <Button asChild size="sm" variant="party">
              <Link to="/catalogo">Comprar ya</Link>
            </Button>
          </li>
        </ul>
        <div className="sm:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú"><Menu /></Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>Menú</SheetTitle>
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
                <Button asChild variant="party" className="mt-auto">
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
