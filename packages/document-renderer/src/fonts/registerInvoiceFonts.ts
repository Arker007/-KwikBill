import { Font } from '@react-pdf/renderer';

let fontsRegistered = false;

export function registerInvoiceFonts(): void {
  if (fontsRegistered) return;

  try {
    // Register standard font aliases if needed
    // Standard built-in PDF fonts (Helvetica, Courier, Times-Roman) do not require external src fetches
    fontsRegistered = true;
  } catch (err) {
    console.warn('Font registration notice:', err);
  }
}
