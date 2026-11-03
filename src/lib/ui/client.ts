/** Shared by static forms and results replaced after every calculation. */
export function initDisclosures() {
  const closeHelp = (restoreFocus = false) => {
    for (const button of document.querySelectorAll<HTMLButtonElement>(
      '[data-help-trigger][aria-expanded="true"]',
    )) {
      button.setAttribute('aria-expanded', 'false');
      const content = document.getElementById(
        button.getAttribute('aria-controls')!,
      );
      if (content) content.hidden = true;
      if (restoreFocus) button.focus();
    }
  };
  document.addEventListener('click', (event) => {
    const target = event.target as Element;
    const reveal = target.closest<HTMLButtonElement>('[data-reveal]');
    if (reveal) {
      const content = document.getElementById(reveal.dataset.reveal!);
      if (content instanceof HTMLDetailsElement) {
        content.open = true;
        content.scrollIntoView({ block: 'start' });
      }
    }
    const button = target.closest<HTMLButtonElement>('[data-help-trigger]');
    if (button) {
      const open = button.getAttribute('aria-expanded') === 'true';
      closeHelp();
      const content = document.getElementById(
        button.getAttribute('aria-controls')!,
      );
      if (content && !open) {
        button.setAttribute('aria-expanded', 'true');
        content.hidden = false;
      }
    } else if (!target.closest('.help-popover')) closeHelp();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeHelp(true);
  });
  document.addEventListener('focusin', (event) => {
    if (!(event.target as Element).closest('.field-help')) closeHelp();
  });
  const revealAnchor = () => {
    let id: string;
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const target = document.getElementById(id);
    if (!target) return;
    for (
      let current: HTMLElement | null = target;
      current;
      current = current.parentElement
    )
      if (current instanceof HTMLDetailsElement) current.open = true;
    target.scrollIntoView({ block: 'start' });
  };
  window.addEventListener('hashchange', revealAnchor);
  if (location.hash) requestAnimationFrame(revealAnchor);
  document.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      'a[href^="#"]',
    );
    if (link && link.hash === location.hash)
      requestAnimationFrame(revealAnchor);
  });
}

export function replaceResult(target: HTMLElement, html: string) {
  const expanded = Array.from(
    target.querySelectorAll<HTMLDetailsElement>('details[open][id]'),
    (d) => d.id,
  );
  target.innerHTML = html;
  for (const id of expanded) {
    const details = document.getElementById(id);
    if (details instanceof HTMLDetailsElement) details.open = true;
  }
}

let toastTimer: ReturnType<typeof setTimeout>;
export function showToast(message: string) {
  const toast = document.getElementById('app-toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = setTimeout(() => {
    toast.hidden = true;
    toast.textContent = '';
  }, 4500);
}
