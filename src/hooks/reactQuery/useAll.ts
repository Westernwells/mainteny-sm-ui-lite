import {QueryKey, useQuery, UseQueryOptions} from 'react-query';
import {Resource, RestError} from 'models/misc';
import {Page} from 'models/pagination';

type QueryFunction<P, T> = (params: P & Page) => Promise<Resource<T>>;

export function useAll<P, T>({
  queryKey,
  queryFn,
  params,
  options,
}: {
  queryKey: QueryKey;
  queryFn: QueryFunction<P, T>;
  params: P;
  options?: UseQueryOptions<T[], RestError>;
}) {
  return useQuery<T[], RestError>(
    queryKey,
    async () => {
      const BACKEND_LIMIT = 500;
      const pageSize = BACKEND_LIMIT;
      // Fetch the first page to determine total items
      const firstPage = await queryFn({...params, pageIndex: 0, pageSize});
      const totalCount = firstPage.total;
      const totalPages = Math.ceil(totalCount / pageSize);

      // If only one page, return the results
      if (totalPages <= 1) {
        return firstPage.data;
      }

      // Create an array of page indices to fetch (excluding the first page)
      const pageIndices = Array.from({length: totalPages - 1}, (_, i) => i + 1);

      // Fetch all other pages in parallel
      const otherPagesPromises = pageIndices.map((pageIndex) =>
        queryFn({...params, pageIndex, pageSize}),
      );

      const otherPages = await Promise.all(otherPagesPromises);

      // Aggregate all items
      const allItems = firstPage.data.concat(
        ...otherPages.map((page) => page.data),
      );

      return allItems;
    },
    {
      ...options,
    },
  );
}
