export const incomeAmounts = [
  ...Array.from({ length: 15 }, (_, i) => 300 + i * 50),
  ...Array.from({ length: 10 }, (_, i) => 1100 + i * 100),
];
export const employeeAmounts = Array.from(
  { length: 9 },
  (_, i) => 400 + i * 100,
);
export const contentUpdated = '2026-10-26';

// Page copy/navigation update, separate from the unchanged calculation-data date.
export const incomePagesUpdated = '2026-11-03';
