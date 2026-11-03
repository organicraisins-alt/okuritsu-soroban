import { readSharedParams } from './shared-url';
import { shareUrl } from './share';
import {
  parseState,
  serializeState,
  stateKeys,
  type ToolKind,
  type ToolState,
} from './state';
import { renderTool } from './render';
import { describeConditions } from '../ui/conditions';
import { replaceResult } from '../ui/client';
import { readHomeState, homeStateUrl } from '../ui/home-state';
import { transitionForYear, analyzeInvoice, percent } from '../tax/invoice';
import { invoiceInputFromState } from './invoice-state';
import { showToast } from '../ui/client';
export function initTool() {
  const panel = document.querySelector<HTMLElement>('[data-tool]'),
    form = document.querySelector<HTMLFormElement>('#tool-form'),
    result = document.querySelector<HTMLElement>('#tool-result');
  if (!panel || !form || !result) return;
  const kind = panel.dataset.tool as ToolKind,
    summary = document.querySelector<HTMLElement>('#form-error')!,
    status = document.querySelector<HTMLElement>('#result-status')!;
  let state: ToolState;
  const onHome = location.pathname === '/';
  const readLocation = () =>
    onHome ? readHomeState(location, 'tedori') : readSharedParams(location);
  const fields = (key: string) =>
    Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
        `[data-key="${key}"]`,
      ),
    );
  function synchronize(s: ToolState) {
    updateSecondary(s);
    for (const key of stateKeys[kind])
      for (const control of fields(key)) {
        if (control instanceof HTMLInputElement && control.type === 'radio')
          control.checked = control.value === String(s[key]);
        else if (
          control instanceof HTMLInputElement &&
          control.type === 'checkbox'
        )
          control.checked = Boolean(s[key]);
        else control.value = String(s[key]);
      }
    updateSecondary(s);
  }
  function updateSecondary(s: ToolState) {
    const preview = form!.querySelector<HTMLElement>(
      '[data-condition-summary]',
    );
    if (preview) preview.textContent = describeConditions(kind, s);
    const manual = document.querySelector<HTMLElement>('#co-manual');
    if (manual) manual.hidden = s.mode !== 'manual';
    const slider = document.querySelector<HTMLInputElement>('#co-salary');
    if (slider)
      slider.max = String(
        Math.max(
          120,
          Math.ceil(Math.max(0, s.sales - s.exp) / 12) * 12,
          s.salary,
        ),
      );
    const setText = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    setText('co-salary-v', s.salary.toLocaleString('ja-JP'));
    setText(
      'co-salary-m',
      (Math.round((s.salary / 12) * 10) / 10).toLocaleString('ja-JP'),
    );
    setText('iv-b2b-v', String(s.b2b));
    if (kind === 'invoice') {
      const ratio = form!.querySelector<HTMLInputElement>('#iv-ratio');
      if (ratio) {
        ratio.value = String(Number((s.ratio * 100).toFixed(4)));
        ratio.disabled = s.ratioMode === 'auto';
      }
      setText('iv-discount-v', String(s.discount));
      setText(
        'iv-effective',
        s.ratioMode === 'auto'
          ? transitionForYear(s.taxYear).label
          : `${s.taxYear}年分は手動上書き ${percent(s.ratio)}（自動値 ${percent(transitionForYear(s.taxYear).ratio)}）`,
      );
      const analysis = analyzeInvoice(invoiceInputFromState(s)),
        marker = document.getElementById('iv-threshold-marker');
      const point = analysis.b2bThreshold;
      if (marker) {
        marker.hidden = !analysis.canCompare || point === null || point > 1;
        if (point !== null) marker.style.left = `${point * 100}%`;
      }
      setText(
        'iv-threshold-hint',
        !analysis.canCompare
          ? '基準期間・適用条件を確認すると分岐点を比較できます。'
          : point === null
            ? analysis.best.amt === 0
              ? '登録時の納税額が0円。値下げなしなら同額です。'
              : 'この条件では分岐点がありません。'
            : point > 1
              ? '100%以内の分岐点はありません。'
              : `約${percent(point)}が分岐点。これを超えると登録が有利になる試算です。`,
      );
      if (s.baseBand === 'unknown') {
        const details = form!.querySelector<HTMLDetailsElement>(
          '#additional-conditions',
        );
        if (details) details.open = true;
      }
    }
  }
  function showErrors(errors: Record<string, string>) {
    const keys = Object.keys(errors);
    summary.hidden = !keys.length;
    summary.textContent = keys.length
      ? '入力を確認してください。結果は最後に計算できた条件のままです。'
      : '';
    result!.classList.toggle('result-stale', keys.length > 0);
    for (const key of stateKeys[kind])
      for (const control of fields(key)) {
        control.setAttribute('aria-invalid', String(Boolean(errors[key])));
        const id = `field-${key}-error`;
        let message = document.getElementById(id);
        if (!message) {
          message = document.createElement('p');
          message.id = id;
          message.className = 'input-error';
          (control.closest('.field') || control.parentElement)!.append(message);
        }
        message.textContent = errors[key] || '';
        message.hidden = !errors[key];
        const helpId = control
          .closest('.field')
          ?.querySelector('[data-help-trigger]')
          ?.getAttribute('aria-controls');
        control.setAttribute(
          'aria-describedby',
          [helpId, id].filter(Boolean).join(' '),
        );
        if (errors[key]) {
          for (
            let parent = control.parentElement;
            parent;
            parent = parent.parentElement
          )
            if (parent instanceof HTMLDetailsElement) parent.open = true;
        }
      }
  }
  function update(query: URLSearchParams, writeUrl: boolean) {
    const parsed = parseState(kind, query);
    showErrors(parsed.errors);
    if (Object.keys(parsed.errors).length) return;
    state = parsed.state;
    updateSecondary(state);
    replaceResult(result!, renderTool(kind, state));
    status.textContent =
      kind === 'invoice'
        ? result!.querySelector('[data-live-summary]')?.textContent ||
          '計算結果を更新しました。'
        : '入力した条件で計算結果を更新しました。';
    if (writeUrl) {
      const url = onHome
        ? homeStateUrl(
            location.href,
            'tedori',
            new URLSearchParams(serializeState(kind, state)),
          )
        : shareUrl(
            location.href,
            new URLSearchParams(serializeState(kind, state)),
          );
      history.replaceState(null, '', url);
    }
  }
  const initial = parseState(kind, readLocation());
  state = initial.state;
  synchronize(state);
  result.innerHTML = renderTool(kind, state);
  showErrors(initial.errors);
  function readForm() {
    const query = new URLSearchParams();
    for (const key of stateKeys[kind]) {
      const controls = fields(key),
        first = controls[0];
      if (!first) continue;
      if (first instanceof HTMLInputElement && first.type === 'radio')
        query.set(
          key,
          controls.find((c) => (c as HTMLInputElement).checked)?.value || '',
        );
      else if (first instanceof HTMLInputElement && first.type === 'checkbox')
        query.set(key, first.checked ? '1' : '0');
      else if (first.dataset.scale) {
        const raw = first.value.normalize('NFKC').trim().replace(/,/g, '');
        query.set(
          key,
          /^-?\d+(?:\.\d+)?$/.test(raw)
            ? String(
                Number((Number(raw) * Number(first.dataset.scale)).toFixed(6)),
              )
            : raw,
        );
      } else query.set(key, first.value);
    }
    return query;
  }
  let timer: ReturnType<typeof setTimeout>;
  let composing = false;
  form.addEventListener('compositionstart', () => {
    composing = true;
    clearTimeout(timer);
  });
  form.addEventListener('input', (e) => {
    if (composing || (e instanceof InputEvent && e.isComposing)) return;
    clearTimeout(timer);
    timer = setTimeout(() => update(readForm(), true), 100);
  });
  form.addEventListener('compositionend', () => {
    composing = false;
    clearTimeout(timer);
    update(readForm(), true);
  });
  form.addEventListener('change', () => {
    if (kind === 'invoice' && !composing) {
      clearTimeout(timer);
      update(readForm(), true);
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (composing) return;
    clearTimeout(timer);
    update(readForm(), true);
    const invalid = form.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (invalid) invalid.focus();
    else if (kind === 'invoice' && matchMedia('(max-width:700px)').matches) {
      result!.scrollIntoView({ block: 'start' });
      result!.focus({ preventScroll: true });
    }
  });
  window.addEventListener('popstate', () => {
    const parsed = parseState(kind, readLocation());
    synchronize(parsed.state);
    update(readLocation(), false);
  });
  document.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a[data-placeholder]'))
      e.preventDefault();
  });
  form.querySelector('[data-share]')?.addEventListener('click', async () => {
    clearTimeout(timer);
    update(readForm(), true);
    const shareStatus = form.querySelector<HTMLElement>('[data-share-status]')!;
    if (!summary.hidden) {
      shareStatus.textContent = '入力を修正してからコピーしてください。';
      showToast('入力を修正してからコピーしてください。');
      return;
    }
    try {
      await navigator.clipboard.writeText(location.href);
      shareStatus.textContent = 'この条件のURLをコピーしました。';
      showToast('コピーしました');
    } catch {
      shareStatus.textContent = 'アドレスバーのURLをコピーしてください。';
      showToast(
        'コピーできませんでした。アドレスバーのURLをコピーしてください。',
      );
    }
  });
  const boxes = Array.from(
    document.querySelectorAll<HTMLInputElement>('#checklist input'),
  );
  boxes.forEach((box) =>
    box.addEventListener('change', () => {
      const n = boxes.filter((b) => b.checked).length;
      document.getElementById('check-score')!.textContent =
        n >= 3
          ? `${n}個当てはまります。法人化を具体的に検討する段階です。税理士に一度相談してみてください。`
          : n >= 1
            ? `${n}個当てはまります。上の法人化シミュレーターで、数字の損得も確認してみてください。`
            : '当てはまる項目にチェックしてください。';
    }),
  );
}
