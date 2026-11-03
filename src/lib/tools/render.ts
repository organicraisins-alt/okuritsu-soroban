import type { ToolKind, ToolState } from './state';
import { shareMarkup } from './share';
import { serializeState } from './state';
import { sole } from '../tax/sole';
import { man } from '../tax/format';
import { renderTedori } from './tedori';
import { renderHoujinka } from './houjinka';
import { renderInvoice } from './invoice';
export function renderTool(kind: ToolKind, state: ToolState): string {
  return kind === 'tedori'
    ? renderTedori(state) +
        shareMarkup(
          `フリーランス利益${man((state.sales - state.exp) * 10000)}、手取りは${man(sole(state.sales * 10000, state.exp * 10000, { blue: state.blue, age40: state.age40, jigyo: state.jigyo, extra: state.extra * 10000 }).total)}でした #億率`,
          '/tools/tedori/',
          new URLSearchParams(serializeState(kind, state)),
        )
    : kind === 'houjinka'
      ? renderHoujinka(state)
      : renderInvoice(state);
}
