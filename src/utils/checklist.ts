import _ from 'lodash';
import {CheckListQuestion} from 'models/checklist';
import {getUniqueId} from './utils';

export const categoriesSortedByOrderNumber = (
  questions: {
    id: string;
    name: string;
    questions: CheckListQuestion[];
  }[],
) =>
  _.sortBy(questions, (c) =>
    c.questions.map((q) => q.additionalInfo.orderNumber),
  );

export const getQuestionsGroupedByCategory = (questions: CheckListQuestion[]) =>
  categoriesSortedByOrderNumber(
    Object.entries(_.groupBy(questions, 'category')).map(
      ([category, value]) => ({
        id: getUniqueId(),
        name: category,
        questions: _.sortBy(value, 'additionalInfo.orderNumber'),
      }),
    ),
  );

export const getOptions = (questions: CheckListQuestion[]) =>
  _.uniqBy(
    _.flatMap(_.flatMap(questions, 'additionalInfo'), 'options'),
    'text',
  );
