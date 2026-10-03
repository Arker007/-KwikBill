import { useState, useEffect, useCallback } from 'react';

/**
 * Event name for local storage change notification across components in the same window
 */
const LOCAL_STORAGE_EVENT = 'fgsb_local_storage_change';

interface LocalStorageCustomEventDetail {
  key: string;
  newValue: any;
}

/**
 * Custom hook for persisting state in browser localStorage with cross-tab and intra-window synchronization.
 * Gracefully degrades if localStorage is disabled, restricted, or sandboxed.
 *
 * @template T
 * @param key The localStorage key to store data under
 * @param initialValue Default value or initializer function if no item is stored yet
 * @returns A tuple of `[storedValue, setValue, removeValue]`
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Read initial stored value safely
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading key "${key}":`, error);
    }

    return typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue;
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((current) => {
          const valueToStore =
            typeof value === 'function' ? (value as (val: T) => T)(current) : value;

          // Prevent circular structure / event object crashes when passed to onClick handlers
          if (
            valueToStore &&
            typeof valueToStore === 'object' &&
            (('target' in valueToStore && 'preventDefault' in valueToStore) ||
              valueToStore instanceof Event ||
              (valueToStore.constructor && valueToStore.constructor.name === 'SyntheticBaseEvent'))
          ) {
            return current;
          }

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            // Dispatch intra-window update event
            window.dispatchEvent(
              new CustomEvent<LocalStorageCustomEventDetail>(LOCAL_STORAGE_EVENT, {
                detail: { key, newValue: valueToStore },
              })
            );
          }

          return valueToStore;
        });
      } catch (error) {
        console.warn(`[useLocalStorage] Error setting key "${key}":`, error);
      }
    },
    [key]
  );

  // Remove value from localStorage and reset to initialValue
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        window.dispatchEvent(
          new CustomEvent<LocalStorageCustomEventDetail>(LOCAL_STORAGE_EVENT, {
            detail: { key, newValue: null },
          })
        );
      }
      setStoredValue(
        typeof initialValue === 'function'
          ? (initialValue as () => T)()
          : initialValue
      );
    } catch (error) {
      console.warn(`[useLocalStorage] Error removing key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Synchronize with external changes (other tabs or intra-window events)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | CustomEvent<LocalStorageCustomEventDetail>) => {
      if ('key' in event && event.key !== null) {
        // Native browser StorageEvent from another tab/window
        if (event.key === key) {
          try {
            const nextVal = event.newValue ? JSON.parse(event.newValue) : initialValue;
            setStoredValue(nextVal);
          } catch {
            setStoredValue(initialValue);
          }
        }
      } else if ('detail' in event && event.detail) {
        // Intra-window custom event
        if (event.detail.key === key) {
          setStoredValue(
            event.detail.newValue !== null
              ? event.detail.newValue
              : typeof initialValue === 'function'
              ? (initialValue as () => T)()
              : initialValue
          );
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange as EventListener);
      window.addEventListener(LOCAL_STORAGE_EVENT, handleStorageChange as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange as EventListener);
        window.removeEventListener(LOCAL_STORAGE_EVENT, handleStorageChange as EventListener);
      }
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
