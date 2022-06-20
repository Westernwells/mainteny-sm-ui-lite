import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FilterFields} from 'components/FilterFields';
import {useQuotations} from 'hooks/reactQuery/useQuotation';
import {QuotationView} from 'models/quotation';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {PageListingLayout} from 'components/PageListingLayout';
import {Widget} from 'components/Widget';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {columns, makeRows} from './QuotationsDataGridProps';

const pageSize = 25;

export const Quotations = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const totalQuotationsRef = useRef(0);
  const [page, setPage] = useState(makePage(0, pageSize));
  const [pageCount, setPageCount] = useState(0);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const {
    data: quotationsResource = createEmptyResource<QuotationView>(pageSize),
    isLoading,
    isFetching,
    isFetched,
  } = useQuotations(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      status: [],
    },
    {},
    {keepPreviousData: true},
  );

  totalQuotationsRef.current =
    totalQuotationsRef.current || quotationsResource.total;

  useEffect(() => {
    if (quotationsResource) {
      setRows(makeRows(quotationsResource));
    } else {
      setRows([]);
    }
  }, [quotationsResource]);

  useEffect(() => {
    setPageCount(Math.ceil(quotationsResource.total / page.pageSize));
  }, [quotationsResource, page.pageSize]);

  if (isFetched && !totalQuotationsRef.current) {
    return (
      <EmptySection
        label="No quotations have been created yet. Please click the button below to create one!"
        showActionBtn
        btnLabel="Add Quotation"
        btnAction={() => navigate('new')}
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  const renderFilterItems = () => (
    <FilterFields>
      <MultipleSelectCheckmarks
        label="Status"
        options={['SENT', 'DRAFT']}
        getSelectedValue={(item) => console.log(item)}
        multiple={false}
      />
    </FilterFields>
  );

  if (isLoading) {
    return <Progress />;
  }

  return (
    <PageListingLayout
      renderWidget={
        <Widget
          searchPlaceholder="Search by number, customer, address etc."
          getSearchValue={(val: string) => setSearch(val)}
          showActionBtn
          btnLabel="New Quotation"
          btnOnClick={() => navigate('new')}
          filterItems={renderFilterItems()}
        />
      }>
      <DataGridLayout
        hideFooter={pageCount <= 1}
        rows={rows}
        columns={columns}
        loading={isFetching}
        pageSize={page.pageSize}
        handlePageSizeChange={(newPageSize: number) =>
          setPage({...page, pageSize: newPageSize})
        }
        handlePageChange={(newPage: number) => {
          setPage({...page, pageIndex: newPage - 1});
        }}
        pageCount={pageCount}
        totalRows={quotationsResource.total}
      />
    </PageListingLayout>
  );
};
