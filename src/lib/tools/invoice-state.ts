import type { ToolState } from './state';
import type { InvoiceInput } from '../tax/invoice';
export function invoiceInputFromState(s: ToolState): InvoiceInput {
  return {
    sales: s.sales * 10000,
    buy: s.buy * 10000,
    b2b: s.b2b / 100,
    deem: s.deem,
    ratio: s.ratioMode === 'auto' ? undefined : s.ratio,
    taxYear: s.taxYear,
    baseBand: s.baseBand,
    baseEligible: s.baseEligible,
    registeredFromExempt: s.registeredFromExempt,
    specialExcluded: s.specialExcluded,
    discount: s.discount / 100,
  };
}
