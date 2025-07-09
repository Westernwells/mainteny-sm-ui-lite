import {Meta} from 'models/misc';
import {OrderQuery, Page} from 'models/pagination';
import {FileWithPreview} from 'models/files';

export const ATTACHMENT_LIMIT = 250;

export const ATTACHMENT_DEPTH_LIMIT = 3;

export enum AttachmentEntityType {
  ADDRESS = 'ADDRESS',
  ARTICLE = 'ARTICLE',
  ARTICLE_SUPPLIER = 'ARTICLE_SUPPLIER',
  ARTICLE_ORDER = 'ARTICLE_ORDER',
  CONTRACT = 'CONTRACT',
  CONTACT_PERSON = 'CONTACT_PERSON',
  ELEVATOR = 'ELEVATOR',
  EMPLOYEE = 'EMPLOYEE',
  INVOICE = 'INVOICE',
  PROPERTY_OWNER = 'PROPERTY_OWNER',
  PROPERTY_CONTACT_PERSON = 'PROPERTY_CONTACT_PERSON',
  QUOTATION = 'QUOTATION',
  CONTACT_PERSON_ASSOCIATION = 'CONTACT_PERSON_ASSOCIATION',
  SERVICE_COMPANY = 'SERVICE_COMPANY',
  SERVICE_COMPANY_ACTIVITY = 'SERVICE_COMPANY_ACTIVITY',
  SERVICE_ORDER = 'SERVICE_ORDER',
  SERVICE_ORDER_REPORT = 'SERVICE_ORDER_REPORT',
  TASK = 'TASK',
}

export const ALLOWED_ATTACHMENT_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/tab-separated-values',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/bmp',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/vnd.ms-outlook',
  'image/tiff',
  'video/mp4',
];

export const ATTACHMENT_FILE_HINT =
  'JPEG, PNG, BMP, GIF, TIFF, PDF, DOC, DOCX, TXT, MSG, SVG, XLSX or MP4';

export enum AttachmentFileType {
  FOLDER = 'FOLDER',
  IMAGE = 'IMAGE',
  TEXT = 'TEXT',
  PDF = 'PDF',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}

const EXTENSION_GROUPS: Record<AttachmentFileType, readonly string[]> = {
  [AttachmentFileType.TEXT]: ['txt', 'csv'],
  [AttachmentFileType.IMAGE]: [
    'jpeg',
    'png',
    'gif',
    'bmp',
    'svg',
    'webp',
    'mp4',
  ],
  [AttachmentFileType.PDF]: ['pdf'],
  [AttachmentFileType.DOCUMENT]: ['docx', 'doc', 'msg'],
  [AttachmentFileType.FOLDER]: [],
  [AttachmentFileType.OTHER]: [],
};

export const ATTACHMENT_FILE_TO_TYPE_MAP: Record<string, AttachmentFileType> =
  Object.entries(EXTENSION_GROUPS)
    .flatMap(([type, exts]) =>
      exts.map((ext) => [ext, type] as [string, AttachmentFileType]),
    )
    .reduce((map, [ext, type]) => {
      map[ext] = type;
      return map;
    }, {} as Record<string, AttachmentFileType>);

export type AttachmentView = {
  id: string;
  serviceCompanyId: string;
  entityType: AttachmentEntityType;
  entityId: string;
  name: string;
  uri?: string;
  isFolder: boolean;
  parentId: string;
  fullPath: string;
  fileType?: string;
  size: number;
  search: string;
  additionalInfo: string;
  totalFiles: number;
  meta: Meta;
};

export type AttachmentNode = {
  value: AttachmentView | 'root';
  children: AttachmentNode[];
};

export type TreeProps = {
  nodes: AttachmentNode[];
  depth?: number;
  parentId?: string;
  parentIndex?: string;
};

export enum AttachmentOrderField {
  NAME = 'NAME',
  SIZE = 'SIZE',
  ENTITY_TYPE = 'ENTITY_TYPE',
  CREATED_AT = 'CREATED_AT',
  LAST_UPDATED_AT = 'LAST_UPDATED_AT',
}

export type GetAttachmentQuery = Partial<Page> &
  Partial<OrderQuery<AttachmentOrderField>> & {
    serviceCompanyId: string;
    entityType?: AttachmentEntityType;
    entityId?: string;
    isFolder?: boolean;
    isNested?: boolean;
    parentId?: string;
    query?: string;
  };

export type CreateAttachmentQuery = {
  serviceCompanyId: string;
  entityType: AttachmentEntityType;
  entityId: string;
  isFolder: boolean;
  virtualPath?: string;
  name?: string;
  parentId?: string;
  uri?: string;
  fileType?: string;
  fileSize?: number;
};

type MandatoryCreateAttachmentFields = Pick<
  CreateAttachmentQuery,
  'entityType' | 'entityId' | 'isFolder' | 'name' | 'parentId'
>;

export type CreateFileProps = MandatoryCreateAttachmentFields & {
  uri: string;
  fileType: string;
  fileSize: number;
  virtualPath?: string;
};

export type CreateFolderProps = MandatoryCreateAttachmentFields;

export type UpdateAttachmentQuery = {
  attachmentName: string;
};

export type AttachmentTableRow = {
  data: AttachmentView;
  id: string;
  name: string;
  size: number;
  modifiedAt: string;
  totalFiles: number;
};

export type AttachmentActions = {
  onPreview: (file: AttachmentView) => void;
  setFileUploadParentId: (value: string | undefined) => void;
};

export type AttachmentS3PathGeneratorProps = {
  serviceCompanyId: string;
  entityType: AttachmentEntityType;
  entityId: string;
  name: string;
};

export type EntityProps = {
  entityType: AttachmentEntityType;
  entityId: string;
};

export type CreatingFolderState = {
  parentId?: string;
  depth: number;
  index: string;
};

export enum UploadStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export type UploadFile = {
  id: string;
  file: FileWithPreview;
  parentId?: string;
  name: string;
  status: UploadStatus;
  error?: string;
};
