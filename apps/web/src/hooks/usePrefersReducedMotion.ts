import { useEffect, useState } from 'react';

/**
 * true solo si el usuario pidió reducir movimiento (ajuste del sistema).
 * IMPORTANTE: se inicializa con el valor real de matchMedia para evitar
 * el "flash" de renderizar primero la variante estática y luego la animada
 * (eso rompía la medición de useScroll en ScrollShowcase).
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(motionQuery.matches);
    motionQuery.addEventListener('change', update);
    return () => motionQuery.removeEventListener('change', update);
  }, []);
  return reduced;
}
