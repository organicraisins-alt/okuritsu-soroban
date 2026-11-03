import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
it('承認済みのブランド配色を共通CSSとDESIGNで共有する', () => {
  const css = readFileSync(
    new URL('../src/styles/global.css', import.meta.url),
    'utf8',
  );
  const design = readFileSync(new URL('../DESIGN.md', import.meta.url), 'utf8');
  for (const [name, value] of Object.entries({
    ai: '#083b43',
    accent: '#cf424b',
    'accent-soft': '#fff0ef',
    ink: '#123b42',
    bg: '#f5f8f8',
    paper: '#ffffff',
  })) {
    expect(css).toContain(`--${name}: ${value};`);
    expect(design).toContain(value);
  }
});
