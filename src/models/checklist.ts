import {EmailRecord, Meta, PdfGenerationStatus} from './misc';
import {ChecklistStatus} from './service-order';

export enum CheckListComponentType {
  HEAD = 'HEAD',
  TEXT = 'TEXT',
  SINGLE_CHECK = 'SINGLE_CHECK',
  MULTIPLE_CHECKS = 'MULTIPLE_CHECKS',
  YES_NO = 'YES_NO',
}

export enum CheckListComponentOptionColor {
  DEFAULT,
  RED,
  YELLOW,
  GREEN,
}

export interface CheckListComponentOption {
  text: string;
  color: CheckListComponentOptionColor;
  isDefault?: Boolean;
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

export interface ServiceOrderCheckListAdditionalInfo {
  technicianSignature?: string;
  pdfPath?: string;
  pdfGenerationStatus?: PdfGenerationStatus;
  status?: ChecklistStatus;
  completedAt?: string;
}

export interface ServiceOrderCheckListView {
  technicianId: string;
  checkListId: string;
  checkList: CheckList;
  additionalInfo: ServiceOrderCheckListAdditionalInfo;
}

export interface SendServiceOrderCheckListRecord {
  technicianId: string;
  checkListId: string;
  pdfPath: string;
  email: EmailRecord;
}
