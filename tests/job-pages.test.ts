import { expect, it } from 'vitest';
import { jobs } from '../src/data/jobs';
import { jobExamples } from '../src/lib/tax/jobs';
it('職業6件と固有の事業税条件で共通税計算する', () => {
  expect(jobs.map((j) => j.slug)).toEqual([
    'engineer',
    'designer',
    'writer',
    'video',
    'consultant',
    'illustrator',
  ]);
  const writer = jobExamples(jobs[2]!);
  expect(writer[0]!.expenses).toBe(360000);
  expect(writer.every((x) => x.result.jg === 0)).toBe(true);
  expect(jobExamples(jobs[1]!)[2]!.result.jg).toBeGreaterThan(0);
});
