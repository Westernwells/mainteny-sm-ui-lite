import {AxiosResponse} from 'axios';
import {MouseEvent, ReactNode} from 'react';
import {UseMutationResult} from 'react-query';
import {number} from 'yup';
import {GetState, SetState} from 'zustand';
import {UserAccountSimpleView} from './user';
import {ContractTypes, ContractNameTypes} from './contract';

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

export interface Meta {
  creator?: UserAccountSimpleView;
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
  emailAddresses: string[];
  emailBasedServiceOrderProvider: string;
  timezone: string;
  managingDirector: string;
  arbitrationCourt: string;
  tradeRegisterNumber: string;
  paymentInfo: PaymentInfo;
  timeFormat: string;
  whiteLabel: {
    logoPath: string;
  };
  currencies: Currency[];
  contractTypes: ContractTypes;
  contractNameTypes: ContractNameTypes[];
}

export interface Page {
  pageIndex: number;
  pageSize: number;
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

export interface AddressRecord {
  fullName: string;
  countryCode: string;
  location: Location;
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

export interface HistoryState {
  search: string;
  page: Page;
}

export interface StringValue {
  value: string;
}

export interface IdValue<T> {
  id: string;
  value: T;
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

export interface KeyValue<T> {
  key: string;
  value: T;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export enum ValueType {
  ELEVATOR_TYPE = 'ELEVATOR_TYPE',
  ELEVATOR_CAPACITY = 'ELEVATOR_CAPACITY',
  ELEVATOR_MODEL = 'ELEVATOR_MODEL',
}

export enum SaveMode {
  NEW,
  EDIT,
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface OrderBy<T> {
  field: T;
  order: Order;
}

export enum TechnicianEventType {
  SICK_LEAVE = 'SICK_LEAVE',
  HOLIDAY = 'HOLIDAY',
  WORK = 'WORK',
}

export enum ContextActionMenu {
  EDIT,
  DELETE,
}

export enum JobStatus {
  INIT = 'INIT',
  RUNNING = 'RUNNING',
  DONE = 'DONE',
  ERROR = 'ERROR',
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
  value: number;
  currency: string;
}

export interface Price {
  amount: number;
  grossAmount: number;
  currency: string;
  vat: number;
}

export interface Amount {
  currency: string;
  fractionDigits: number;
  grossAmount: number;
  netAmount: number;
  percentageVat: number;
  vat: number;
}

export interface AmountRecord {
  currency: string;
  netAmount: number;
  percentageVat: number;
}

export interface PaymentInfo {
  accountNumber: string;
  bic: string;
  iban: string;
}

export enum PdfGenerationStatus {
  DONE = 'DONE',
  ERROR = 'ERROR',
  INIT = 'INIT',
  RUNNING = 'RUNNING',
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

export type StoreSlice<T extends object, E extends object = T> = (
  set: SetState<E extends T ? E : E & T>,
  get: GetState<E extends T ? E : E & T>,
) => T;

export interface MenuBtnProps {
  label: string;
  action: (event: MouseEvent<HTMLLIElement>) => void;
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

export enum Language {
  EN_US = 'EN_US',
  DE_DE = 'DE_DE',
  SR_RS = 'SR_RS',
}
