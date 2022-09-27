import {Meta} from './misc';

export enum CommentType {
  ELEVATOR_NOTE = 'ELEVATOR_NOTE',
  ELEVATOR_TODO = 'ELEVATOR_TODO',
  INVOICE_COMMENT = 'INVOICE_COMMENT',
  QUOTATION_COMMENT = 'QUOTATION_COMMENT',
}

export interface Comment {
  id: string;
  refId: string;
  type: CommentType;
  subject: string;
  content: string;
  meta: Meta;
}
