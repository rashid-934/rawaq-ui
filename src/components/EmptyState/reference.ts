// The small code an error screen shows in place of the error itself. A person passes it on to
// support; the app's own log holds the same code next to the real error. No React here, so server
// code can use it too.

/** Short and plain: letters, digits, "-" and "_". An error message or a stack never fits. */
const REFERENCE = /^[A-Za-z0-9_-]{4,64}$/;

/**
 * True for a text that may be shown as a reference code. Anything else (a sentence, a stack, a
 * file path) is refused, so an error message passed in by mistake never reaches the screen.
 */
export function isReferenceCode(value: unknown): value is string {
  return typeof value === 'string' && REFERENCE.test(value);
}

/** Capital letters and digits that are not mistaken for each other when read out (no 0, O, 1, I). */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/** A new random reference code, 8 characters unless asked otherwise. */
export function makeReference(length = 8): string {
  const bytes = new Uint8Array(Math.max(4, Math.min(64, Math.trunc(length))));
  globalThis.crypto.getRandomValues(bytes);
  // 256 is a whole multiple of the 32 characters, so every character is equally likely.
  return Array.from(bytes, (byte) => ALPHABET.charAt(byte % ALPHABET.length)).join('');
}
