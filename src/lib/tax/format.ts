export const yen = (n: number): string =>
  Math.round(n).toLocaleString('ja-JP') + '円';
export const man = (n: number): string =>
  (Math.round(n / 1000) / 10).toLocaleString('ja-JP', {
    maximumFractionDigits: 1,
  }) + '万円';
export const floorTo = (n: number, unit: number): number =>
  Math.floor(n / unit) * unit;
export function assertFinite(...values: number[]): void {
  if (values.some((n) => !Number.isFinite(n)))
    throw new RangeError('金額・割合には有限の数値を指定してください。');
}
