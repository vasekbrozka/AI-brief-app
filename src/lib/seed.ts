// Small deterministic helpers: the daily quiz shuffles its options and the
// term of the day picks an entry from a date string, so every device shows the
// same order on the same day without any shared state.

/** FNV-1a 32-bit hash of a string. */
export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A permutation of 0..n-1 derived from the seed (Fisher–Yates over an LCG). */
export function shuffledOrder(n: number, seed: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  let x = seed || 1;
  for (let i = n - 1; i > 0; i--) {
    x = (Math.imul(x, 1103515245) + 12345) >>> 0;
    const j = x % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
