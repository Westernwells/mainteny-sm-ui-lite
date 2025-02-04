import {AxiosResponse} from 'axios';
import {MouseEvent, ReactNode} from 'react';
import {UseMutationResult} from 'react-query';
import {UserAccountSimpleView} from './user';
import {ContractNameTypes, ContractTypes} from './contract';
import {AccountSystems, MinToStep} from './service-company';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {CompanyStatus} from './company';
import {Page} from './pagination';
import {VersionType} from './versions';
import {VatAmount} from './invoice';

export interface RestError {
  errorCode: number;
  message: string;
}

export enum State {
  ACTIVE = 'ACTIVE',
  DELETED = 'DELETED',
}

export enum DispatchStrategy {
  BIG_BANG = 'BIG_BANG',
  ASSIGNMENT_WEIGHTS = 'ASSIGNMENT_WEIGHTS',
}

export interface Meta extends SimpleMeta {
  creator?: UserAccountSimpleView | null;
  deleted?: boolean;
}

export interface SimpleMeta {
  createdAt: string;
  lastUpdatedAt: string;
  state: State;
}

export interface Currency {
  code: string;
  fractionDigits: number;
  symbol: string;
}

export interface Settings {
  nightlyShuffleEnabled: boolean;
  isNightlyShuffleEnabled: boolean;
  companyDispatchStrategy: DispatchStrategy;
  totalYearlyVacationDaysAllowed: number;
  dateFormat: string;
  percentageVat: number;
  vatId: string;
  taxNumber: string;
  emailAddresses: string[];
  emailBasedServiceOrderProvider: string;
  timezone: string;
  managingDirector: string;
  owner?: string;
  arbitrationCourt: string;
  tradeRegisterNumber: string;
  paymentInfo: PaymentInfo;
  paymentInfo2: PaymentInfo;
  timeFormat: string;
  whiteLabel: {
    logoPath: string;
  };
  currencies: Currency[];
  contractTypes: ContractTypes;
  contractNameTypes: ContractNameTypes[];
  serviceOrderGenerationEnabled?: boolean;
  contractInvoiceGenerationEnabled?: boolean;
  invoiceQRCodeEnabled?: boolean;
  isContractInvoiceGenerationEnabled?: boolean;
  serviceOrderGenerationDaysInAdvance?: number;
  minToHourStep?: MinToStep | number;
  accountSystem?: AccountSystems;
  status: CompanyStatus;
  userLimits: {
    maxContractorCount: number;
    maxMainUserCount: number;
  };
  expiryDate: string;
  accountantNumber?: string;
  clientNumber?: string;
  fiscalYearStart?: string;
}

export interface Resource<T> {
  data: T[];
  total: number;
  page: Page;
}

export interface Location {
  longitude: number;
  latitude: number;
}

export interface AddressComponent {
  name?: string;
  street?: string;
  street2?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  moreInfo?: string;
}

export interface AddressRecord {
  fullName: string | null;
  countryCode?: string | null;
  location?: Location | null;
  component?: AddressComponent | null;
}

export interface Address extends AddressRecord {
  id: string;
}

export interface Contact {
  phone: string;
  email: string;
}

export interface CompanyContact extends Contact {
  url: string;
}

export interface StringMap<T> {
  [key: string]: T;
}

export interface StringValue {
  value: string;
}

export enum TimeWindowType {
  WEEKDAY = 'WEEKDAY',
  WEEKEND = 'WEEKEND',
  PUBLIC_HOLIDAY = 'PUBLIC_HOLIDAY',
}

export interface TimeWindowRecord {
  fromTime: string;
  toTime: string;
  type: TimeWindowType;
}

export enum JobStatus {
  INIT = 'INIT',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export enum ReportStatus {
  INIT = 'INIT',
  COMPLETED = 'COMPLETED',
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface Fee {
  amount: number;
  currency: string;
  fractionDigits: number;
}

export enum Priority {
  A = 'A',
  B = 'B',
  C = 'C',
  NONE = 'NONE',
}

export interface StringValueResponse {
  value: string;
}

export interface Money {
  value?: number;
  currency: string;
  fractionDigits?: number;
}

export interface Price {
  amount: number;
  grossAmount: number;
  currency: string;
  vat: number;
}

export interface Amount {
  currency: string;
  fractionDigits?: number;
  grossAmount?: number;
  netAmount?: number;
  percentageVat?: number;
  vat?: number;
}

export interface MultiVatsAmount extends Amount {
  vatId?: string;
  vatName?: string;
  vats: VatAmount[];
  vatInfos?: VatInfo[];
}

export interface VatInfo {
  vatId?: string;
  vatName?: string;
}
export interface AmountRecord {
  currency: string;
  netAmount?: number;
  percentageVat?: number;
  vatId?: string;
  vatName?: string;
}

export interface PaymentInfo {
  bankName: string;
  accountNumber?: string;
  bic?: string;
  iban: string;
}

export enum PdfGenerationStatus {
  DONE = 'DONE',
  ERROR = 'ERROR',
  INIT = 'INIT',
  RUNNING = 'RUNNING',
  GENERATION_REQUIRED = 'GENERATION_REQUIRED',
}

export interface WeekPair {
  startOfWeekDay: Date;
  endOfWeekDay: Date;
}

export type WithOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export interface BasicDetailsValue {
  label: string;
  value: string | ReactNode;
  icon: JSX.Element;
}

export interface MenuBtnProps {
  label: string;
  action: (event: MouseEvent<HTMLLIElement>) => void;
  icon?: JSX.Element;
}

export enum CacheTypes {
  ELEVATOR_CAPACITY = 'ELEVATOR_CAPACITY',
  ELEVATOR_MODEL = 'ELEVATOR_MODEL',
  ELEVATOR_SKILL = 'ELEVATOR_SKILL',
  ELEVATOR_TYPE = 'ELEVATOR_TYPE',
}

export interface CacheTypesParams {
  pageSize: number;
  pageIndex: number;
  query: string;
}

export type Mutation = UseMutationResult<
  AxiosResponse<StringValue, any>,
  unknown,
  string,
  unknown
>;

export type FormatDate = (
  input?: string | Date | undefined,
  dateFormat?: string | undefined,
) => string | undefined;

export interface SimpleEmailRecord {
  email: string;
  subject: string;
  content: string;
}

export interface EmailRecord {
  email: string;
  subject: string;
  content: string;
  emails?: string[];
  ccEmails?: string[];
  bccEmails?: string[];
  attachments?: FileWithPreview[];
}

export enum Language {
  EN_US = 'EN_US',
  DE_DE = 'DE_DE',
  SR_RS = 'SR_RS',
  IT_IT = 'IT_IT',
  IT_LT = 'IT_LT',
  RU_RU = 'RU_RU',
  DA_DK = 'DA_DK',
  KA_GE = 'KA_GE',
  ES_ES = 'ES_ES',
  GR_GR = 'GR_GR',
  TR_TR = 'TR_TR',
}

export interface Coord {
  lat: number | (() => number);
  lng: number | (() => number);
}

export interface GeocodeAddressViewport {
  northeast: Coord;
  southwest: Coord;
}

export interface GeocodeAddressGeometry {
  location: Coord;
  location_type: string;
  viewport: GeocodeAddressViewport;
}

export interface GeocodeAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GeocodeAddress {
  address_components: GeocodeAddressComponent[];
  formatted_address: string;
  place_id: string;
  types?: string[];
  geometry: GeocodeAddressGeometry;
  components?: {[key: string]: {short_name: string; long_name: string}[]};
  description?: string;
}

export interface GeocodeAddressView {
  plus_code: {
    compound_code: string;
    global_code: string;
  };
  results: GeocodeAddress[];
  status: string;
}

export enum IdStateType {
  ADDRESS = 'ADDRESS',
  ARTICLE = 'ARTICLE',
  ARTICLE_SUPPLIER = 'ARTICLE_SUPPLIER',
  ARTICLE_ORDER = 'ARTICLE_ORDER',
  CONTRACT = 'CONTRACT',
  ELEVATOR = 'ELEVATOR',
  EMPLOYEE = 'EMPLOYEE',
  INVOICE = 'INVOICE',
  PROPERTY_OWNER = 'PROPERTY_OWNER',
  PROPERTY_CONTACT_PERSON = 'PROPERTY_CONTACT_PERSON',
  QUOTATION = 'QUOTATION',
  SERVICE_COMPANY = 'SERVICE_COMPANY',
  SERVICE_ORDER = 'SERVICE_ORDER',
  SERVICE_ORDER_REPORT = 'SERVICE_ORDER_REPORT',
}

export interface IdStateParams {
  id: string[];
  type: IdStateType;
}

export interface IdState {
  id: string;
  state: State;
}

export enum InspectionCycle {
  NONE = 'NONE',
  MONTHLY = 'MONTHLY',
  BIMONTHLY = 'BIMONTHLY',
  QUARTERLY = 'QUARTERLY',
  QUADRIMESTERLY = 'QUADRIMESTERLY',
  HALF_YEARLY = 'HALF_YEARLY',
  YEARLY = 'YEARLY',
  BIENNIALLY = 'BIENNIALLY',
  TRIENNIALLY = 'TRIENNIALLY',
}

export interface HeaderFooterInfoData {
  path: string;
  width: number;
  height: number;
  posX: number;
  posY: number;
}

export type CreateEditMode = 'create' | 'edit';
export type CreateEditViewMode = 'view' | 'edit' | 'create';

export type EmailObject = {
  bccEmails: string[];
};

export enum DataEditingScope {
  ALL = 'ALL',
  FUTURE = 'FUTURE',
}

export const getVersionType = (hostname: string): VersionType => {
  switch (hostname) {
    case 'app.mainteny.com':
      return VersionType.WEB_PROD;
    case 'release.mainteny.com':
      return VersionType.WEB_RELEASE;
    default:
      return VersionType.WEB_STAGING;
  }
};

export interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}
