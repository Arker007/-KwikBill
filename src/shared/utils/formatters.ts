export * from '@free-gst/financial-core';

export const safeStringify = (obj: any, space?: number): string => {
  const seen = new WeakSet();
  try {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (
          seen.has(value) ||
          (typeof window !== 'undefined' && value === window) ||
          (typeof document !== 'undefined' && value === document) ||
          value?.constructor?.name === 'Window' ||
          value?.constructor?.name === 'Document'
        ) {
          return '[Circular / Window]';
        }
        seen.add(value);
      }
      return value;
    }, space);
  } catch (err) {
    try {
      return String(obj?.message || obj || 'Unknown error');
    } catch {
      return 'Unknown error';
    }
  }
};
