import {ElevatorView} from './elevator';
import {EmployeeAdditionalInfo} from './employee';
import {Address, Meta} from './misc';
import {Order} from './pagination';
import {ServiceOrderView} from './service-order';
import {Tag, TagRecord} from './tag';
import {UserAccountSimpleView} from './user';

export enum TaskOrderField {
  NAME = 'NAME',
  EXTERNAL_ID = 'EXTERNAL_ID',
  STATUS = 'STATUS',
  CREATED_AT = 'CREATED_AT',
  LAST_UPDATED_AT = 'LAST_UPDATED_AT',
  ASSIGNEE_LAST_NAME = 'ASSIGNEE_LAST_NAME',
  CREATOR_LAST_NAME = 'CREATOR_LAST_NAME',
  TAG_COUNT = 'TAG_COUNT',
  HAS_DESCRIPTION = 'HAS_DESCRIPTION',
  OVERDUE = 'OVERDUE',
}

export enum TaskAssignmentType {
  ALL = 'ALL',
  OFFICE = 'OFFICE',
  TECHNICIANS = 'TECHNICIANS',
  SINGLE = 'SINGLE',
}

export enum TaskStatus {
  TO_DO = 'TO_DO',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  DONE = 'DONE',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
}

export enum TaskRefEntityType {
  ELEVATOR = 'ELEVATOR',
  SERVICE_ORDER = 'SERVICE_ORDER',
}

export const taskRefEntityTypeToLabel = {
  [TaskRefEntityType.ELEVATOR]: 'Unit',
  [TaskRefEntityType.SERVICE_ORDER]: 'Job',
};

export const EXTRA_ASSIGNMENT_OPTIONS_MAP: {[key: string]: string} = {
  [TaskAssignmentType.OFFICE]: 'Office',
  [TaskAssignmentType.TECHNICIANS]: 'Technicians',
};

export const EXTRA_ASSIGNMENT_OPTIONS = Object.keys(
  EXTRA_ASSIGNMENT_OPTIONS_MAP,
);

export interface TaskAdditionalInfo {
  tags: TagRecord[];
}

export interface TaskAssignedEmployee {
  id: string;
  number: string;
  externalId: string;
  team: string;
  address: Address;
  userAccount: UserAccountSimpleView;
  isOnline: boolean;
  additionalInfo: EmployeeAdditionalInfo;
  meta: Meta;
  online: boolean;
}

export interface TaskView {
  id: string;
  serviceCompanyId: string;
  name: string;
  description: string;
  externalId: string;
  assignedEmployee?: TaskAssignedEmployee;
  assignmentType: TaskAssignmentType;
  dueDate: string;
  status: TaskStatus;
  refEntityId?: string;
  refEntityType?: TaskRefEntityType;
  refEntity?: ServiceOrderView | ElevatorView;
  additionalInfo: TaskAdditionalInfo;
  sortFields?: {
    tagCount?: number;
    hasDescription?: boolean;
  };
  search: string;
  meta: Meta;
}

export type TaskTableRow = {
  data: TaskView;
  id: string;
  name: string;
  status: TaskStatus;
  description: string;
  createdAt: string;
  assignedEmployee?: TaskAssignedEmployee;
  assignmentType?: TaskAssignmentType;
  tags: TagRecord[];
  refEntityType?: TaskRefEntityType;
  creator: UserAccountSimpleView;
  task: TaskView;
  dueDate?: string;
};

export interface QueryTasksParams {
  assignedEmployeeId?: string;
  assignmentType?: TaskAssignmentType;
  createdDateEnd?: string;
  createdDateStart?: string;
  dueDateEnd?: string;
  dueDateStart?: string;
  order?: Order;
  orderBy?: TaskOrderField;
  pageIndex?: number;
  pageSize?: number;
  query?: string;
  refEntityId?: string;
  refEntityType?: TaskRefEntityType;
  status?: TaskStatus[];
  tagName?: string[];
}

export interface TaskStatistics {
  numOfTasksPerAssignmentType: Record<string, number>;
}

export type NewTaskForm = {
  name: string;
  description: string;
  status: TaskStatus;
  dueDate?: Date;
  assignment?: TaskAssignment;
  tags?: Tag[];
  refEntity?: TaskRefEntity;
};

export interface TaskRefEntity {
  id: string;
  type: TaskRefEntityType;
}

export interface TaskFormRefEntity {
  refId?: string;
  refType?: TaskRefEntityType;
}

export interface CreateTaskBody {
  serviceCompanyId: string;
  name: string;
  description: string;
  assignment?: TaskAssignment;
  dueDate?: string;
  refEntity?: TaskRefEntity;
  tags?: string[];
  status?: TaskStatus;
}

export type UpdateTaskBody = Partial<Omit<CreateTaskBody, 'serviceCompanyId'>>;

export interface TaskAssignment {
  employeeId?: string;
  type: TaskAssignmentType;
}

export type TaskFilterForm = {
  status: TaskStatus[];
  tagName: string[];
  assignedEmployeeId?: string;
  assignmentType?: TaskAssignmentType;
  dueDateEnd?: Date;
  dueDateStart?: Date;
  refEntity?: TaskFormRefEntity;
};

export const TASK_STATUS_ICON_COLOR = {
  [TaskStatus.TO_DO]: {background: '#828DA3', text: 'white'},
  [TaskStatus.IN_PROGRESS]: {background: '#000034', text: 'white'},
  [TaskStatus.PAUSED]: {background: '#ED6C02', text: 'white'},
  [TaskStatus.DONE]: {background: '#4CAF50', text: 'white'},
  [TaskStatus.ARCHIVED]: {background: '#828DA3', text: 'white'},
};

export enum TaskQuickFilter {
  ALL = 'ALL',
  My_TASKS = 'My_TASKS',
  TECHNICIANS = 'TECHNICIANS',
  OFFICE = 'OFFICE',
}

export const TASK_QUICK_FILTER_LABEL_MAP = {
  [TaskQuickFilter.My_TASKS]: 'My tasks',
  [TaskQuickFilter.ALL]: 'All',
  [TaskQuickFilter.TECHNICIANS]: 'Technicians',
  [TaskQuickFilter.OFFICE]: 'Office',
};
