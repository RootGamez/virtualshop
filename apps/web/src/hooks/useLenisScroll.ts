import { useEffect } from 'react';
import Lenis from 'lenis';

/**
 * Smooth scroll premium (spec §3). Respeta prefers-reduced-motion: si el
 * usuario lo pide, no se instancia Lenis y el navegador usa scroll nativo.
 */
export function useLenisScroll(): void {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    let frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);
}
