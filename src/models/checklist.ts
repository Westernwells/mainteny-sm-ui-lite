import {Meta, Priority} from './misc';

export enum CheckListQuestionType {
  HEAD = 'HEAD',
  TEXT = 'TEXT',
  SINGLE_CHECK = 'SINGLE_CHECK',
  MULTIPLE_CHECKS = 'MULTIPLE_CHECKS',
  YES_NO = 'YES_NO',
}

export enum CheckListComponentType {
  HEAD = 'HEAD',
  TEXT = 'TEXT',
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

export enum CheckListComponentOptionColor {
  DEFAULT,
  RED,
  YELLOW,
  GREEN,
}

export interface CheckListQuestionOption {
  text: string;
  color: CheckListQuestionOptionColor;
  isDefault?: Boolean;
  moreInfoInNote?: Boolean;
}

export interface CheckListComponentOption {
  text: string;
  color: CheckListComponentOptionColor;
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

export interface CheckListComponentAdditionalInfo {
  options: CheckListComponentOption[];
  orderNumber?: number;
  answer?: string[];
  note?: string;
  moreInfoInNote?: Boolean;
}

export interface CheckListComponentView {
  category: string;
  checkListId: string;
  id: string;
  subject: string;
  type: CheckListComponentType;
  answer: any;
  note?: string;
  additionalInfo: CheckListComponentAdditionalInfo;
}

export interface CheckList {
  id: string;
  serviceCompanyId: string;
  number: string;
  externalId: string;
  name: string;
  category: string;
  components: CheckListComponentView[];
  questions: CheckListQuestion[];
  search: string;
  meta: Meta;
}

export interface CheckListComponentRecord {
  subject: string;
  type: CheckListComponentType;
  options: CheckListComponentOption[];
  orderNumber?: number;
  moreInfoInNote?: Boolean;
}

export interface CreateCheckListRecord {
  serviceCompanyId: string;
  name: string;
  externalId?: string;
  components: CheckListComponentRecord[];
}

export interface UpdateCheckListRecord {
  name?: string;
  externalId?: string;
  components: CheckListComponentRecord[];
}

export interface ExtendedCheckListComponentOption {
  id: string;
  text: string;
  color: CheckListComponentOptionColor;
  isDefault?: Boolean;
}

export interface ExtendedCheckListComponentRecord {
  id: string;
  subject: string;
  type: CheckListComponentType;
  options: ExtendedCheckListComponentOption[];
  orderNumber?: number;
  moreInfoInNote?: Boolean;
  checked?: Boolean;
  note?: string;
}

export interface ExtendedCreateCheckListRecord {
  serviceCompanyId: string;
  name: string;
  externalId?: string;
  components: ExtendedCheckListComponentRecord[];
}

export interface ExtendedUpdateCheckListRecord {
  name?: string;
  externalId?: string;
  components: ExtendedCheckListComponentRecord[];
}
