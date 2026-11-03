import * as soleApi from '../../src/lib/tax/sole';
import * as corpApi from '../../src/lib/tax/corp';
import * as employeeApi from '../../src/lib/tax/employee';
import {
  invoice as currentInvoice,
  type InvoiceInput,
} from '../../src/lib/tax/invoice';
export { legacyParams as legacy } from '../../src/lib/tax/legacy-profile';
import { legacyParams as legacy } from '../../src/lib/tax/legacy-profile';
export const basicIT = (n: number) => soleApi.basicIT(n, legacy);
export const basicRT = (n: number) => soleApi.basicRT(n, legacy);
export const incomeTaxRaw = (n: number) => soleApi.incomeTaxRaw(n, legacy);
export const salaryDed = (n: number) => soleApi.salaryDed(n, legacy);
export const personalTax = (i: number, s: number, e: number) =>
  soleApi.personalTax(i, s, e, legacy);
export const kokuho = (i: number, a: boolean) => soleApi.kokuho(i, a, legacy);
export const sole = (s: number, e: number, o: soleApi.SoleOptions) =>
  soleApi.sole(s, e, o, legacy);
export const corpTax = (p: number) => corpApi.corpTax(p, legacy);
export const corp = (s: number, e: number, r: number, o: corpApi.CorpOptions) =>
  corpApi.corp(s, e, r, o, legacy);
export const bestCorp = (s: number, e: number, o: corpApi.CorpOptions) =>
  corpApi.bestCorp(s, e, o, legacy);
export const employee = (g: number) => employeeApi.employee(g, legacy);
export const employeeEquivalent = (g: number) =>
  employeeApi.employeeEquivalent(g, legacy);
export const invoice = (i: InvoiceInput) => currentInvoice(i, legacy);
