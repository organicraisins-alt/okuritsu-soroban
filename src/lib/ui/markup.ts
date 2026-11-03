import { escapeHtml } from '../tools/markup';

export function helpMarkup(id: string, label: string, body: string) {
  return `<span class="field-help"><button class="help-trigger" type="button" data-help-trigger aria-label="${escapeHtml(label)}の説明" aria-expanded="false" aria-controls="${escapeHtml(id)}" aria-describedby="${escapeHtml(id)}">?</button><span class="help-popover" id="${escapeHtml(id)}" hidden>${escapeHtml(body)}</span></span>`;
}

/** body is trusted, server/client-generated markup; never pass URL text here. */
export function disclosure(id: string, title: string, body: string) {
  if (!body.trim()) return '';
  return `<details class="disclosure" id="${escapeHtml(id)}"><summary>${escapeHtml(title)}<span class="disclosure-icon" aria-hidden="true">＋</span></summary><div class="disclosure-body">${body}</div></details>`;
}
