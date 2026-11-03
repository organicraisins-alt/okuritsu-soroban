export function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function normalReturns(
  seed: number,
  count: number,
  mean: number,
  sd: number,
) {
  const random = mulberry32(seed),
    out = new Float64Array(count);
  for (let i = 0; i < count; i += 2) {
    const radius = Math.sqrt(-2 * Math.log(1 - random())),
      angle = 2 * Math.PI * random();
    out[i] = mean + sd * radius * Math.cos(angle);
    if (i + 1 < count) out[i + 1] = mean + sd * radius * Math.sin(angle);
  }
  return out;
}
