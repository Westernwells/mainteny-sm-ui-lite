import {ReactNode} from 'react';
import {GetState, SetState} from 'zustand';

export interface RestError {
  errorCode: string;
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
  creator?: string;
  createdAt: string;
  lastUpdatedAt: string;
  state: State;
}

export interface Settings {
  nightlyShuffleEnabled: boolean;
  companyDispatchStrategy: DispatchStrategy;
  totalYearlyVacationDaysAllowed: number;
  dateFormat: string;
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

export interface AddressViewRecord {
  fullName: string;
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

export enum Language {
  'en-US' = 'en-us',
  'de-DE' = 'de-de',
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

export interface Fee {
  amount: number;
  currency: string;
}

export interface Price {
  amount: number;
  grossAmount: number;
  currency: string;
  vat: number;
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
