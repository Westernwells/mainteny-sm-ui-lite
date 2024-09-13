import {useEffect, useMemo, useState} from 'react';
import {UseInfiniteQueryOptions, UseInfiniteQueryResult} from 'react-query';
import {Resource, RestError} from 'models/misc';
import {Page} from '../models/pagination';

type FetchFunctionType<T> = (
  id: string,
  params: Page,
  options?: UseInfiniteQueryOptions<any, any, any>,
) => UseInfiniteQueryResult<Resource<T>, RestError>;

export const useTotalNotesData = <T>(
  fetchFunction: FetchFunctionType<T>,
  id: string,
) => {
  const {data = {pages: []}} = fetchFunction(id, {
    pageIndex: 0,
    pageSize: 10,
  });

  const [total, setTotal] = useState(0);

  const totalData = useMemo(() => {
    const pages = data?.pages;
    return pages?.[pages.length - 1]?.total ?? 0;
  }, [data.pages]);

  useEffect(() => {
    setTotal(totalData);
  }, [totalData]);

  return total;
};

export default useTotalNotesData;
