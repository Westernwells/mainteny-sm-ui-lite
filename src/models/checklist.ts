import {Meta, Priority} from './misc';

export enum CheckListQuestionType {
  SINGLE_CHECK = 'SINGLE_CHECK',
}

export interface ChecklistQuestion {
  checklistId: string;
  id: string;
  question: string;
  type: CheckListQuestionType;
}

export interface Checklist {
  category: string;
  id: string;
  meta: Meta;
  name: string;
  questions: ChecklistQuestion[];
  search: string;
  serviceCompanyId: string;
}
