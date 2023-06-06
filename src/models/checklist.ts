import {Meta, Priority} from './misc';

export enum CheckListQuestionType {
  SINGLE_CHECK = 'SINGLE_CHECK',
  MULTIPLE_CHECKS = 'MULTIPLE_CHECKS',
  YES_NO = 'YES_NO',
}

export enum CheckListQuestionOptionColor {
  DEFAULT,
  RED,
  YELLOW,
  GREEN,
}

export interface CheckListQuestionOption {
  text: string;
  color: CheckListQuestionOptionColor;
  isDefault?: Boolean;
}

export interface CheckListQuestionAdditionalInfo {
  options: CheckListQuestionOption[];
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

export interface CheckListQuestionRecord {
  category: string;
  question: string;
  type: CheckListQuestionType;
  options: CheckListQuestionOption[];
  orderNumber?: number;
}

export interface CreateCheckListRecord {
  serviceCompanyId: string;
  name: string;
  externalId?: string;
  category: string;
  questions: CheckListQuestionRecord[];
}

export interface UpdateCheckListRecord {
  name: string;
  externalId: string;
  category: string;
  questions: CheckListQuestionRecord[];
}
