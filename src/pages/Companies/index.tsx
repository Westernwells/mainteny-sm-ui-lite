import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {GridRowsProp} from '@mui/x-data-grid';

import {PageListingLayout} from 'components/PageListingLayout';
import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {Progress} from 'components/Progress';
import {useFormatDate} from 'hooks/useFormatDate';
import {useCompanies} from 'hooks/reactQuery/useCompanies';
import {useQueryState} from 'hooks/useQueryState';
import {ServiceCompanyItem} from 'models/service-company';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {Widget} from '../../components/Widget';
import {columns, makeRows} from './CompaniesDataGridProps';

const pageSize = 13;

export const Companies = () => {
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const [search, setSearch] = useQueryState('searchCompanies');
  const totalCompaniesRef = useRef(0);
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const textInput = useRef<HTMLInputElement>(null);

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
    if (companiesResource.total > 0 && companiesResource.data.length === 0) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
    if (textInput.current) {
      textInput.current.value = search;
    }
  }, [search]);

  useEffect(() => {
    if (!isLoading) {
      setRows(makeRows(companiesResource.data, formatDate));
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
          refInput={textInput}
        />
      }>
      <DataGridLayout
        rows={rows || []}
        columns={columns}
        scrollToTop={search}
        loading={isFetching}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setPage({
            ...page,
            pageSize: newPageSize,
          })
        }
        handlePageChange={(newPage: number) =>
          setPage({
            ...page,
            pageIndex: newPage - 1,
          })
        }
        pageCount={pageCount}
        totalRows={companiesResource.total}
      />
    </PageListingLayout>
  );
};

export default Companies;
