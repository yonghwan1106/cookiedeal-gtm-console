// Deterministic seeded RNG (mulberry32) so every build produces identical data.
// Reference: https://stackoverflow.com/a/47593316

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed: number) {
  const rand = mulberry32(seed);
  return {
    next: () => rand(),
    int: (min: number, max: number) =>
      Math.floor(rand() * (max - min + 1)) + min,
    float: (min: number, max: number) => rand() * (max - min) + min,
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)],
    pickN: <T>(arr: readonly T[], n: number): T[] => {
      const copy = [...arr];
      const out: T[] = [];
      for (let i = 0; i < Math.min(n, copy.length); i++) {
        const idx = Math.floor(rand() * copy.length);
        out.push(copy.splice(idx, 1)[0]);
      }
      return out;
    },
    bool: (probability = 0.5) => rand() < probability,
    // box-muller normal distribution
    normal: (mean: number, stdDev: number) => {
      const u1 = rand();
      const u2 = rand();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return mean + stdDev * z0;
    },
  };
}

export type Rng = ReturnType<typeof makeRng>;
