import {Resource} from '../models/misc';
import {
  BOUNDARY_STEP,
  EDGE_LIMIT,
  MAXIMUM_PAGES_AT_ONCE,
  Order,
  Page,
} from '../models/pagination';

const DEFAULT_PAGE_INDEX = 0;
const DEFAULT_PAGE_SIZE = 25;

export function createResource<T>(
  data: T[],
  page: Page,
  total: number,
): Resource<T> {
  return {
    data,
    page,
    total,
  };
}

export function createEmptyResource<T>(pageSize = 10): Resource<T> {
  return {
    data: [],
    page: {
      pageIndex: -1,
      pageSize,
    },
    total: 0,
  };
}

export function getPageCount<T>(res: Resource<T>): number {
  return Math.floor((res.total - 1) / res.page.pageSize) + 1;
}

export function isLastPage<T>(res: Resource<T>): Boolean {
  const pageCount = getPageCount(res);
  return res.page.pageIndex >= pageCount - 1;
}

export function isEmpty<T>(res: Resource<T>): Boolean {
  return res.page.pageIndex >= 0 && res.data.length === 0;
}

export function hasPreviousPage<T>(res: Resource<T>): Boolean {
  return res.page.pageIndex > 0;
}

export function hasNextPage<T>(res: Resource<T>): Boolean {
  return res.page.pageIndex === -1 || !isLastPage(res);
}

export function getFirstPage<T>(res: Resource<T>): Page {
  return {
    pageIndex: 0,
    pageSize: res.page.pageSize,
  };
}

export function getNextPage<T>(res: Resource<T>): Page | undefined {
  if (hasNextPage(res)) {
    return {
      pageIndex: res.page.pageIndex + 1,
      pageSize: res.page.pageSize,
    };
  }
  return undefined;
}

export function getToPage<T>(res: Resource<T>, target: number): Page {
  return {
    pageIndex: target,
    pageSize: res.page.pageSize,
  };
}

export function getPreviousPage<T>(res: Resource<T>): Page | undefined {
  if (hasPreviousPage(res)) {
    return {
      pageIndex: res.page.pageIndex - 1,
      pageSize: res.page.pageSize,
    };
  }
  return undefined;
}

export function getLastPage<T>(res: Resource<T>): Page {
  const pageCount = getPageCount(res);
  const pageIndex = pageCount > 0 ? pageCount - 1 : 0;
  return {
    pageIndex,
    pageSize: res.page.pageSize,
  };
}

export function isFirstPage<T>(res: Resource<T>): Boolean {
  return res.page.pageIndex === 0;
}

export function makePage(pageIndex?: number, pageSize?: number): Page {
  return {
    pageIndex: pageIndex || DEFAULT_PAGE_INDEX,
    pageSize: pageSize || DEFAULT_PAGE_SIZE,
  };
}

export function mergeResource<T>(
  targetRes: Resource<T>,
  sourceRes: Resource<T>,
): Resource<T> {
  sourceRes.data.forEach((item) => targetRes.data.push(item));
  targetRes.page = sourceRes.page;
  targetRes.total = sourceRes.total;
  return targetRes;
}

// Calculates when the page should not be shown
export const removePageIndex = (
  pageIndex: number,
  selectedPageIndex: number,
  totalPages: number,
) => {
  if (totalPages <= MAXIMUM_PAGES_AT_ONCE) return false;

  // is first or last page
  if (pageIndex === 0 || pageIndex === totalPages) return false;

  // is selected page is inside of the left edge limit
  if (
    selectedPageIndex < EDGE_LIMIT &&
    (pageIndex <= EDGE_LIMIT || pageIndex >= totalPages - EDGE_LIMIT)
    // show selection side and last 3 element
  )
    return false;
  // is selected page is inside of the right edge limit
  if (
    selectedPageIndex > totalPages - EDGE_LIMIT &&
    (pageIndex >= totalPages - EDGE_LIMIT || pageIndex <= EDGE_LIMIT) // show selection side and first 3 element
  )
    return false;

  // page is between the boundary of the selected page and outside of the edge limit
  if (
    selectedPageIndex >= EDGE_LIMIT &&
    selectedPageIndex <= totalPages - EDGE_LIMIT &&
    selectedPageIndex >= pageIndex - BOUNDARY_STEP &&
    selectedPageIndex <= pageIndex + BOUNDARY_STEP
  )
    return false;

  return true;
};

// Calculate where should dotted pages be added
export const getDotsSide = (
  pageIndex: number, // 1
  selectedPageIndex: number, // 3
  totalPages: number, // 19
): 'left' | 'right' | undefined => {
  if (totalPages <= MAXIMUM_PAGES_AT_ONCE) return;

  // do not show dots for the first and last pages given a limit
  if (
    (selectedPageIndex < EDGE_LIMIT && pageIndex < EDGE_LIMIT) ||
    (selectedPageIndex > totalPages - EDGE_LIMIT &&
      pageIndex > totalPages - EDGE_LIMIT)
  )
    return;

  // show dots after limit if selected page is in start limit
  if (selectedPageIndex < EDGE_LIMIT && pageIndex === EDGE_LIMIT)
    return 'right';

  // show dots before limit if selected page is in end limit
  if (
    selectedPageIndex > totalPages - EDGE_LIMIT &&
    pageIndex === totalPages - EDGE_LIMIT
  ) {
    return 'left';
  }

  // Show dots on the left limit side
  if (
    selectedPageIndex >= EDGE_LIMIT &&
    pageIndex === selectedPageIndex - BOUNDARY_STEP &&
    pageIndex <= totalPages - EDGE_LIMIT
  )
    return 'left';

  // Show dots on the right limit side
  if (
    selectedPageIndex >= EDGE_LIMIT &&
    pageIndex === selectedPageIndex + BOUNDARY_STEP &&
    pageIndex >= EDGE_LIMIT
  )
    return 'right';

  // Outside of the  limit
};

export const calculateTotalPages = (totalElement: number, pageSize: number) => {
  const quotient = Math.floor(totalElement / pageSize);
  const remainder = totalElement % pageSize;
  return quotient + (remainder > 0 ? 1 : 0);
};

export const toggleOrder = (order?: Order) => {
  if (!order) return Order.ASC;
  return order === Order.ASC ? Order.DESC : Order.ASC;
};
