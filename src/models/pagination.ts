export const ELEMENTS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export const BOUNDARY_STEP = 1;
export const EDGE_LIMIT = 2; // used with indexes
export const MAXIMUM_PAGES_AT_ONCE = 7;

export interface Page {
  pageIndex: number;
  pageSize: number;
}

export type PageDetails = {
  value: number | null;
  index: number | null;
  isSelected: boolean;
  hasDots?: 'left' | 'right';
};

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface OrderByParams<T> {
  orderByField: T;
  sortOrder: Order;
}

export type HeaderSortingState = {
  columnName?: string;
  order?: Order;
};
