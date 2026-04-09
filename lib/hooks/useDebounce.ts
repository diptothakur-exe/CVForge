// lib/hooks/useDebounce.ts

import { useEffect, useRef, useCallback } from "react";

/**
 * Returns a debounced version of `fn` that delays invocation
 * by `delay` ms after the last call.
 *
 * Stable reference across renders — safe to use in useEffect deps.
 */
export function useDebounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): T {
  const fnRef = useRef(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep ref current without re-creating debounced fn
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    },
    [delay]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return debounced;
}
