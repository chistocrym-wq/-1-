import { lesenExamSets } from './examSets';
import { lesenExamSetsExtra } from './examSetsExtra';

for (const set of lesenExamSetsExtra) {
  if (!lesenExamSets.some((existing) => existing.id === set.id)) {
    lesenExamSets.push(set);
  }
}
