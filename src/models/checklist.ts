import {Meta, Priority} from './misc';

export enum CheckListQuestionType {
  SINGLE_CHECK = 'SINGLE_CHECK',
  MULTIPLE_CHECKS = 'MULTIPLE_CHECKS',
  YES_NO = 'YES_NO',
}

export enum CheckListOptionColor {
  DEFAULT = 'gray',
  RED = '#FFECCF',
  YELLOW = 'warning.fade',
  GREEN = 'success.fade',
}

export interface CheckListOption {
  text: string;
  color: CheckListOptionColor;
}

export interface CheckListQuestionAdditionalInfo {
  options: CheckListOption[];
  orderNumber: number;
  answer?: string[];
  note: string;
}

export interface CheckListQuestion {
  id: string;
  checkListId: string;
  category: string;
  question: string;
  type: CheckListQuestionType;
  additionalInfo: CheckListQuestionAdditionalInfo;
}

export interface CheckList {
  id: string;
  serviceCompanyId: string;
  number: string;
  externalId: string;
  name: string;
  category: string;
  questions: CheckListQuestion[];
  search: string;
  meta: Meta;
}
