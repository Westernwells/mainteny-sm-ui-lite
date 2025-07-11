import React from 'react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {renderHook, act, waitFor} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from 'react-query';
import {axiosClient} from '../../utils/axios-utils';
import {ArticleType, ArticleView} from '../../models/article';
import {Meta, MultiVatsAmount, Resource} from '../../models/misc';
import {MAX_PAGE_SIZE} from '../../models/table';
import {
  useArticles,
  useInfiniteArticles,
} from '../../hooks/reactQuery/useArticle';

vi.mock('../../hooks/reactQuery/useUserSession', () => ({
  useUserSession: () => ({
    user: {
      userAccount: {
        serviceCompany: {id: 'b270952a-7d58-458f-8259-4fd4091612fd'},
      },
    },
  }),
}));

const getSpy = vi.spyOn(axiosClient, 'get');

const wrapper = ({children}: {children: React.ReactNode}) => {
  const qc = new QueryClient({defaultOptions: {queries: {retry: false}}});
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useArticles (single‐page)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads exactly one page when pageSize < MAX_PAGE_SIZE', async () => {
    // Prepare a stubbed page of 25 items
    const singlePage: Resource<ArticleView> = {
      data: Array.from({length: 25}, (_, i) => ({
        id: `ID_${i}`,
        additionalInfo: undefined,
        canDelete: true,
        category: '',
        description: '',
        externalId: '',
        manufacturer: '',
        meta: {} as Meta,
        model: '',
        name: '',
        number: '',
        search: '',
        serviceCompanyId: '',
        stock: {currentStock: 0, maxStock: 0, minOrderQuantity: 0, minStock: 0},
        storageLocation: '',
        subCategory: '',
        type: ArticleType.MATERIAL,
        unit: '',
        unitSellingAmount: {} as MultiVatsAmount,
        suppliers: [],
      })),
      page: {pageIndex: 0, pageSize: 25},
      total: 100,
    };
    getSpy.mockResolvedValueOnce({data: singlePage});

    const {result} = renderHook(
      () =>
        useArticles({query: 'foo', pageIndex: 0, pageSize: 25}, {}, false, 0),
      {wrapper},
    );

    await waitFor(() => {
      expect(result.current.data?.data).toHaveLength(25);
    });

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(result.current.data?.data[0].id).toBe('ID_0');
  });
});

describe('useInfiniteArticles (infinite scroll)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads page 1, then page 2, then page 3 on fetchNextPage()', async () => {
    const page0: Resource<ArticleView> = {
      data: Array.from({length: MAX_PAGE_SIZE}, (_, i) => ({
        id: `A${i}`,
        additionalInfo: undefined,
        canDelete: true,
        category: '',
        description: '',
        externalId: '',
        manufacturer: '',
        meta: {} as Meta,
        model: '',
        name: '',
        number: '',
        search: '',
        serviceCompanyId: '',
        stock: {currentStock: 0, maxStock: 0, minOrderQuantity: 0, minStock: 0},
        storageLocation: '',
        subCategory: '',
        type: ArticleType.LABOR,
        unit: '',
        unitSellingAmount: {} as MultiVatsAmount,
        suppliers: [],
      })),
      page: {pageIndex: 0, pageSize: MAX_PAGE_SIZE},
      total: 108,
    };
    // Page 1: next 50
    const page1: Resource<ArticleView> = {
      data: page0.data.map((pageData, i) => ({...pageData, id: `A${50 + i}`})),
      page: {pageIndex: 1, pageSize: MAX_PAGE_SIZE},
      total: 108,
    };
    // Page 2: final 8
    const page2: Resource<ArticleView> = {
      data: Array.from({length: 8}, (_, i) => ({
        ...page0.data[i],
        id: `A${100 + i}`,
      })),
      page: {pageIndex: 2, pageSize: 8},
      total: 108,
    };

    getSpy
      .mockResolvedValueOnce({data: page0})
      .mockResolvedValueOnce({data: page1})
      .mockResolvedValueOnce({data: page2});

    const {result} = renderHook(
      () => useInfiniteArticles({query: 'bar', type: []}, MAX_PAGE_SIZE),
      {wrapper},
    );

    await waitFor(() => {
      expect(result.current.items).toHaveLength(MAX_PAGE_SIZE);
      expect(result.current.hasNextPage).toBe(true);
    });

    // fetch page 1
    await act(async () => {
      await result.current.fetchNextPage();
    });
    await waitFor(() => {
      expect(result.current.items).toHaveLength(100);
      expect(result.current.hasNextPage).toBe(true);
    });

    // fetch page 2
    await act(async () => {
      await result.current.fetchNextPage();
    });
    await waitFor(() => {
      expect(result.current.items).toHaveLength(108);
      expect(result.current.hasNextPage).toBe(false);
    });

    expect(getSpy).toHaveBeenCalledTimes(3);

    expect(result.current.items[0].id).toBe('A0');
    expect(result.current.items[107].id).toBe('A107');
  });
});
