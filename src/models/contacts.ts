import {Meta, Contact, Priority, Address, CompanyContact, Order} from './misc';
import {UserAccountStatus, UserAccountView} from './user';

export interface ContactsView {
  id: string;
  customerId: string;
  meta: Meta;
  number: string;
  userAccount: ContactsUserAccount;
  propertyOwner: PropertyOwner;
  additionalInfo: {
    secondaryPhone?: string;
    contactPersonId: string;
  };
}

export const PORTAL_PERSON_STATUS = {
  ACTIVE: UserAccountStatus.NORMAL || UserAccountStatus.RESET_PASSWORD,
  PENDING: UserAccountStatus.INVITATION_SENT,
  REVOKED: UserAccountStatus.LOCKED,
  INACTIVE: UserAccountStatus.INIT,
} as const;

export interface PropertyOwner {
  id: string;
  additionalInfo: Priority;
  contact: CompanyContact;
  name: string;
  labels: string[];
  billingAddress?: Address;
  beneficiaryAddress?: Address;
  otherAddress?: Address;
  serviceCompanyId: string;
  secondaryPhoneNumber?: string;
}

interface ContactsMeta extends Meta {
  deleted: boolean;
}

interface ContactsUserAccount extends UserAccountView {
  meta: ContactsMeta;
  category: string;
  contact: Contact;
  search: string;
  title: string;
}

export enum ContactsStatus {
  ACTIVE = 'NORMAL',
  INACTIVE = 'INIT',
  PENDING = 'INVITATION_SENT',
}

export interface ContactFormModel {
  phone: string;
  secondaryPhone: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string;
}

export interface ContactBody {
  propertyContactPerson: {
    externalId: string;
    roles: string[];
    propertyOwnerId?: string;
    secondaryPhone?: string;
  };
  userAccount: {
    category: string;
    contact: Contact;
    firstName: string;
    lastName: string;
    photoUrl: string;
    title: string;
    username: string;
    serviceCompanyId?: string;
  };
}

export enum ContactTitle {
  'Mr' = 'Mr',
  'Ms' = 'Ms',
  'Diverse' = 'Diverse',
}

export enum ServiceCompanyContactPersonOrderField {
  NAME = 'NAME',
  EXTERNAL_ID = 'EXTERNAL_ID',
  ROLE = 'ROLE',
  COMPANY = 'COMPANY',
  PHONE = 'PHONE',
  SECONDARY_PHONE = 'SECONDARY_PHONE',
  EMAIL = 'EMAIL',
  COMMENT_COUNT = 'COMMENT_COUNT',
  CREATED_DATE = 'CREATED_DATE',
}

export enum ServiceCompanyContactPersonRole {
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  ASSISTANT = 'ASSISTANT',
  FACILITY_MANAGER = 'FACILITY_MANAGER',
  PROPERTY_MANAGER = 'PROPERTY_MANAGER',
  CONTACT_PERSON = 'CONTACT_PERSON',
  ASSET_OWNER = 'ASSET_OWNER',
  OTHER_CONTACT = 'OTHER_CONTACT',
  OTHERS = 'OTHERS',
}

export interface ServiceCompanyContactPersonQueryParams {
  order?: Order;
  orderBy?: ServiceCompanyContactPersonOrderField;
  pageIndex?: number;
  pageSize: number;
  query?: string;
  role: ServiceCompanyContactPersonRole[];
}

export interface ContactPersonAssociationQueryParams {
  contactPersonId: string;
  pageIndex?: number;
  pageSize: number;
  refType?: ContactPersonAssociationType;
}

export interface RefContactPersonQueryParams {
  pageIndex: number;
  pageSize: number;
  refId: string;
  refType: ContactPersonAssociationType;
}

export interface CreatePropertyContactPersonRecord {
  contactPersonId: string;
  username?: string;
  externalId?: string;
}

export interface CreateContactPersonAssociationRecord {
  refType: ContactPersonAssociationType;
  refId: string;
}

export interface ContactPersonAdditionalInfo {
  secondaryPhone?: string;
}

export interface ServiceCompanyContactPersonView {
  id: string;
  externalId: string;
  companyName: string;
  commentCount?: number;
  userAccount: UserAccountView;
  additionalInfo: ContactPersonAdditionalInfo;
  meta: Meta;
}

export interface ContactPersonAssociationView {
  id: string;
  contactPersonId: string;
  refId: string;
  refType: ContactPersonAssociationType;
  additionalInfo: string;
  meta: Meta;
  data: unknown;
}

export interface RefContactPersonView extends ServiceCompanyContactPersonView {
  associationId: string;
}

export enum ContactPersonAssociationType {
  PROPERTY_OWNER = 'PROPERTY_OWNER',
  ELEVATOR = 'ELEVATOR',
  CONTRACT = 'CONTRACT',
  ARTICLE_SUPPLIER = 'ARTICLE_SUPPLIER',
  SERVICE_ORDER = 'SERVICE_ORDER',
}

export const ConnectionTypeLabels: {
  [key in ContactPersonAssociationType]: string;
} = {
  [ContactPersonAssociationType.PROPERTY_OWNER]: 'Customer',
  [ContactPersonAssociationType.ELEVATOR]: 'Unit_elevator',
  [ContactPersonAssociationType.CONTRACT]: 'Contract',
  [ContactPersonAssociationType.ARTICLE_SUPPLIER]: 'Supplier',
  [ContactPersonAssociationType.SERVICE_ORDER]: 'Job',
};

export interface ServiceCompanyContactPeronFormModel {
  userAccount: {
    firstName: string;
    lastName: string;
    photoUrl: string;
    contact: {
      phone?: string;
      email?: string;
    };
    serviceCompanyId: string;
    category?: string;
    title?: string;
    reportToUser?: string;
  };
  contactPerson: {
    roles: ServiceCompanyContactPersonRole[];
    contactPersonId?: string;
    companyName?: string;
    externalId?: string;
    secondaryPhone?: string;
  };
}
