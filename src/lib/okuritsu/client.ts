import { trackEvent } from '../analytics';
import { replaceResult } from '../ui/client';
import { readHomeState, homeStateUrl } from '../ui/home-state';
import {
  defaults,
  parseInput,
  parseSimpleInput,
  serializeInput,
  presets,
  type OkuritsuInput,
} from './model';
import { renderOkuritsu } from './render';
import { readSharedParams } from '../tools/shared-url';
for (const panel of document.querySelectorAll<HTMLElement>('[data-okuritsu]')) {
  const simple = panel.dataset.simple === 'true',
    form = panel.querySelector<HTMLFormElement>('form')!,
    result = panel.querySelector<HTMLElement>('[data-oku-result]')!,
    error = panel.querySelector<HTMLElement>('[data-oku-errors]')!,
    status = panel.querySelector<HTMLElement>('[data-oku-status]')!;
  const controls = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-oku]'),
  );
  let state = { ...defaults };
  function sync() {
    for (const c of controls)
      c.value = String(
        state[c.dataset.oku as keyof OkuritsuInput] / Number(c.dataset.scale),
      );
    const select = form.querySelector<HTMLSelectElement>('[data-preset]');
    if (select) {
      const n = presets.findIndex(
        (p) => p.mean === state.mean && p.volatility === state.volatility,
      );
      select.value = n < 0 ? 'custom' : String(n);
    }
  }
  function updateSummary() {
    const summary = form.querySelector<HTMLElement>('[data-oku-summary]');
    if (summary)
      summary.textContent = `${state.blue === 650000 ? '青色65万円' : state.blue === 100000 ? '青色10万円' : '白色'}・iDeCo 月${(state.ideco / 12).toLocaleString('ja-JP')}円・共済 月${(state.kyosai / 12).toLocaleString('ja-JP')}円／平均${Number((state.mean * 100).toFixed(2))}%・幅${Number((state.volatility * 100).toFixed(2))}%`;
  }
  function display(errors: string[]) {
    error.hidden = errors.length === 0;
    error.textContent = errors.length
      ? errors.join(' ') + ' 結果は最後に計算できた条件のままです。'
      : '';
    if (errors.length) {
      const extra = form.querySelector<HTMLDetailsElement>('#oku-additional');
      if (extra) extra.open = true;
    }
    result.classList.toggle('result-stale', errors.length > 0);
    for (const c of controls)
      c.setAttribute('aria-invalid', String(errors.length > 0));
  }
  function restore() {
    const parsed = (simple ? parseSimpleInput : parseInput)(
      simple && location.pathname === '/'
        ? readHomeState(location, 'okuritsu')
        : readSharedParams(location),
    );
    if (parsed.errors.length) {
      display(parsed.errors);
      return;
    }
    state = parsed.input;
    sync();
    replaceResult(result, renderOkuritsu(state, simple));
    updateSummary();
    display([]);
  }
  restore();
  window.addEventListener('popstate', restore);
  form.querySelector('[data-preset]')?.addEventListener('change', () => {
    const select = form.querySelector<HTMLSelectElement>('[data-preset]')!,
      p = presets[Number(select.value)];
    if (select.value === 'custom') {
      const details = form.querySelector<HTMLDetailsElement>('#oku-additional');
      if (details) details.open = true;
    }
    if (p) {
      for (const key of ['mean', 'volatility'] as const)
        form.querySelector<HTMLInputElement>(`[data-oku="${key}"]`)!.value =
          String(p[key] * 100);
    }
  });
  for (const c of controls.filter((c) =>
    ['mean', 'volatility'].includes(c.dataset.oku!),
  ))
    c.addEventListener('input', () => {
      form.querySelector<HTMLSelectElement>('[data-preset]')!.value = 'custom';
    });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const params = serializeInput(state);
    let invalid = false;
    for (const c of controls) {
      const raw = c.value.normalize('NFKC').trim().replace(/,/g, '');
      if (!/^-?\d+(?:\.\d+)?$/.test(raw)) {
        invalid = true;
        break;
      }
      params.set(c.dataset.oku!, String(Number(raw) * Number(c.dataset.scale)));
    }
    if (invalid) {
      display([
        'すべての入力を数値で入力してください。結果は直前の条件のままです。',
      ]);
      return;
    }
    const parsed = parseInput(params);
    display(parsed.errors);
    if (parsed.errors.length) return;
    state = parsed.input;
    trackEvent('okuritsu_calculate', simple ? 'home' : 'okuritsu');
    const started = performance.now();
    replaceResult(result, renderOkuritsu(state, simple));
    updateSummary();
    const elapsed = performance.now() - started;
    const url =
      simple && location.pathname === '/'
        ? homeStateUrl(location.href, 'okuritsu', params)
        : new URL(location.href);
    if (!(simple && location.pathname === '/')) {
      url.search = params.toString();
      url.hash = '';
    }
    history.replaceState(null, '', url);
    status.textContent = `億率を更新しました。計算時間${Math.round(elapsed)}ミリ秒。`;
  });
}
