import {Meta} from './misc';

export enum CommentType {
  ELEVATOR_NOTE = 'ELEVATOR_NOTE',
  ELEVATOR_TODO = 'ELEVATOR_TODO',
  INVOICE_COMMENT = 'INVOICE_COMMENT',
  QUOTATION_COMMENT = 'QUOTATION_COMMENT',
}

export enum CommentStatus {
  DEFAULT = 'DEFAULT',
  RESOLVED = 'RESOLVED',
}

export interface CommentRecord {
  subject: string;
  content: string;
}

export interface Comment {
  id: string;
  refId: string;
  type: CommentType;
  subject: string;
  content: string;
  status: CommentStatus;
  serviceCompanyId: string;
  meta: Meta;
}
