/** Cover a positive range using 1/2/5 × a power of ten, including zero. */
export function niceAxis(ceiling: number) {
  if (!Number.isFinite(ceiling) || ceiling <= 0)
    throw new RangeError('軸の上限は正の有限値が必要です。');
  const raw = ceiling / 6,
    unit = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].find((n) => n * unit >= raw)! * unit;
  const count = Math.ceil(ceiling / step),
    max = count * step;
  return {
    step,
    max,
    ticks: Array.from({ length: count + 1 }, (_, i) => i * step),
  };
}
export function axisLabel(amount: number) {
  return amount >= 100000000
    ? `${Number((amount / 100000000).toPrecision(4))}億円`
    : `${(amount / 10000).toLocaleString('ja-JP')}万円`;
}
