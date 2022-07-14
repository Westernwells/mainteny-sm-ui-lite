import {useEffect, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {GridRowsProp} from '@mui/x-data-grid';

import {PageListingLayout} from 'components/PageListingLayout';
import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {Progress} from 'components/Progress';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {useCompanies} from 'hooks/reactQuery/useCompanies';
import {ServiceCompanyItem} from 'models/service-company';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {Widget} from '../../components/Widget';
import {columns, makeRows} from './CompaniesDataGridProps';

const pageSize = 13;

export const Companies = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [queryParams, setQueryParams] = useSearchParams();
  const totalCompaniesRef = useRef(0);
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {
    data: companiesResource = createEmptyResource<ServiceCompanyItem>(pageSize),
    isLoading,
    isFetching,
    isFetched,
    isIdle,
  } = useCompanies(page, search, {keepPreviousData: true});

  totalCompaniesRef.current =
    totalCompaniesRef.current || companiesResource.total;

  useEffect(() => {
    if (page.pageIndex) {
      setQueryParams(formatSearchParamsPageIndex(1, queryParams));
    }
  }, [search]);

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);

    if (currentParams.pageSize)
      setPage({
        ...page,
        pageSize: Number(currentParams.pageSize),
      });
    if (currentParams.pageIndex)
      setPage({
        ...page,
        pageIndex: Number(currentParams.pageIndex) - 1,
      });
  }, [queryParams]);

  useEffect(() => {
    if (!isLoading) {
      setRows(makeRows(companiesResource.data));
    }
  }, [companiesResource, isLoading]);

  useEffect(() => {
    setPageCount(Math.ceil(companiesResource.total / page.pageSize));
  }, [companiesResource, page.pageSize]);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (isFetched && !totalCompaniesRef.current) {
    return (
      <EmptySection
        label="No companies have been created yet. Please click the button below to create one!"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  return (
    <PageListingLayout
      renderWidget={
        <Widget
          searchPlaceholder="Search by number, customer, contract type etc."
          getSearchValue={(val: string) => setSearch(val)}
          btnOnClick={() => navigate('/admin/companies/new')}
          showActionBtn
          btnLabel="New Company"
        />
      }>
      <DataGridLayout
        rows={rows || []}
        columns={columns}
        scrollToTop={search}
        loading={isFetching}
        hideFooter={pageCount <= 1}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setQueryParams(formatSearchParamsPageSize(newPageSize, queryParams))
        }
        handlePageChange={(newPage: number) =>
          setQueryParams(formatSearchParamsPageIndex(newPage, queryParams))
        }
        pageCount={pageCount}
        totalRows={companiesResource.total}
      />
    </PageListingLayout>
  );
};
