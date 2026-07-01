import { useEffect, useState } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const smallOrCoarse = window.matchMedia('(max-width: 767px), (pointer: coarse)');
    const update = () => setReduced(motionQuery.matches || smallOrCoarse.matches);
    update();
    motionQuery.addEventListener('change', update);
    smallOrCoarse.addEventListener('change', update);
    return () => {
      motionQuery.removeEventListener('change', update);
      smallOrCoarse.removeEventListener('change', update);
    };
  }, []);
  return reduced;
}
