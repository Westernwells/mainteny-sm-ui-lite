import {Meta} from './misc';

export enum CommentType {
  ELEVATOR_NOTE = 'ELEVATOR_NOTE',
  ELEVATOR_TODO = 'ELEVATOR_TODO',
  INVOICE_COMMENT = 'INVOICE_COMMENT',
  QUOTATION_COMMENT = 'QUOTATION_COMMENT',
  CONTRACT_COMMENT = 'CONTRACT_COMMENT',
  PROPERTY_OWNER_COMMENT = 'PROPERTY_OWNER_COMMENT',
  SERVICE_ORDER_COMMENT = 'SERVICE_ORDER_COMMENT',
  CONTACT_PERSON = 'CONTACT_PERSON',
  ARTICLE_COMMENT = 'ARTICLE_COMMENT',
  ARTICLE_SUPPLIER_COMMENT = 'ARTICLE_SUPPLIER_COMMENT',
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
  category: CommentCategory;
}

export enum CommentCategory {
  ALL = 'ALL',
  OFFICE = 'OFFICE',
}

export interface QueryCommentsParams {
  category: CommentCategory;
  pageIndex?: number;
  pageSize?: number;
  refId: string;
  type: CommentType;
}

export interface CreateCommentBody {
  serviceCompanyId: string;
  subject: string;
  content: string;
  refId: string;
  type: CommentType;
  category: CommentCategory;
}

export interface UpdateCommentBody
  extends Partial<
    Omit<CreateCommentBody, 'serviceCompanyId' | 'subject' | 'content'>
  > {
  subject: string;
  content: string;
}
