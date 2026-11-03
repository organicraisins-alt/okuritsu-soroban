import { readSharedParams } from './shared-url';
import { shareUrl } from './share';
import { renderEmployeeComparison } from './employee-comparison';
const form = document.querySelector<HTMLFormElement>('#expense-form');
if (form) {
  const gross = Number(form.dataset.gross),
    input = form.querySelector<HTMLInputElement>('#expense-rate')!,
    output = document.querySelector<HTMLElement>('#comparison-result')!,
    error = document.querySelector<HTMLElement>('#expense-error')!,
    status = document.querySelector<HTMLElement>('#comparison-status')!;
  const update = (raw: string, write: boolean) => {
    const normalized = raw.normalize('NFKC').trim();
    const n = /^\d+(?:\.\d{1,2})?$/.test(normalized) ? Number(normalized) : NaN;
    const valid = Number.isFinite(n) && n >= 0 && n <= 90;
    error.hidden = valid;
    input.setAttribute('aria-invalid', String(!valid));
    output.classList.toggle('result-stale', !valid);
    if (!valid) {
      error.textContent =
        '経費率は0〜90%で入力してください。結果は直前の条件のままです。';
      return;
    }
    output.innerHTML = renderEmployeeComparison(gross, n / 100);
    status.textContent = `経費率${n}%で比較を更新しました。`;
    if (write) {
      const url = shareUrl(
        location.href,
        new URLSearchParams({ expenseRate: String(n) }),
      );
      history.replaceState(null, '', url);
    }
  };
  const initial = readSharedParams(location).get('expenseRate');
  if (initial !== null) {
    input.value = initial;
    update(initial, false);
  }
  let timer: ReturnType<typeof setTimeout>;
  input.addEventListener('input', (e) => {
    if ((e as InputEvent).isComposing) return;
    clearTimeout(timer);
    timer = setTimeout(() => update(input.value, true), 100);
  });
  input.addEventListener('compositionend', () => update(input.value, true));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(timer);
    update(input.value, true);
    if (!error.hidden) input.focus();
  });
  window.addEventListener('popstate', () => {
    input.value = readSharedParams(location).get('expenseRate') || '20';
    update(input.value, false);
  });
}
