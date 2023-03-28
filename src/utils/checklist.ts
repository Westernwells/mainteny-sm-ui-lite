import _ from 'lodash';
import {CheckListQuestion} from 'models/checklist';
import {getUniqueId} from './utils';

export const getQuestionsGroupedByCategory = (questions: CheckListQuestion[]) =>
  Object.entries(_.groupBy(questions, 'category')).map(([category, value]) => ({
    id: getUniqueId(),
    name: category,
    questions: value,
  }));

export const getOptions = (questions: CheckListQuestion[]) =>
  _.uniqBy(
    _.flatMap(_.flatMap(questions, 'additionalInfo'), 'options'),
    'text',
  );
