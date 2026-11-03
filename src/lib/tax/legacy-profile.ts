import { P, type TaxParams } from './params';
import { P as original } from './prototype-params';
export const legacyParams: TaxParams = {
  ...P,
  ...original,
  version: 'prototype',
  kk: original.kk,
  salary: { ...P.salary, ...original.salary },
  invoice: { ...P.invoice, ...original.invoice },
};
