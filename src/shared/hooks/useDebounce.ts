import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook that returns a debounced version of the passed value.
 * The debounced value will only reflect the latest value once the specified delay has passed
 * without the value changing.
 *
 * @template T
 * @param value The value to debounce (e.g., search term, form input)
 * @param delay Milliseconds to wait before updating debounced value (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook that returns a debounced version of the passed callback function.
 *
 * @template T
 * @param callback The function to debounce
 * @param delay Milliseconds to delay invocation (default: 300ms)
 * @returns A memoized debounced function with a cancel method
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  const callbackRef = useRef<T>(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cancel;
  }, [cancel]);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [cancel, delay]
  );

  return Object.assign(debouncedFn, { cancel });
}
