import type { Job } from '../../data/jobs';
import { sole } from './sole';
import { standardOptions } from './content';
export function jobExamples(job: Job) {
  return job.sales.map((amount) => {
    const sales = amount * 10000,
      expenses = Math.round(sales * job.expenseRatio);
    return {
      sales,
      expenses,
      result: sole(sales, expenses, { ...standardOptions, jigyo: job.jigyo }),
    };
  });
}
