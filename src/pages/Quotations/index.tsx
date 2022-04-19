import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import {GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FilterFields} from 'components/FilterFields';
import {useQuotations} from 'hooks/reactQuery/useQuotation';
import {QuotationView} from 'models/quotation';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {PageOverviewLayout} from 'components/PageOverviewLayout';
import {Widget} from 'components/Widget';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {CustomPagination} from 'components/CustomPagination';
import {columns, makeRows} from './QuotationsDataGridProps';

const pageSize = 25;

export const Quotations = () => {
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(makePage(0, pageSize));
  const [showFilter, setShowFilter] = useState(false);
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

  useEffect(() => {
    if (quotationsResource) {
      setRows(makeRows(quotationsResource));
    } else {
      setRows([]);
    }
    if (!showFilter) {
      console.log('Filter Enabled:', showFilter);
    }
  }, [quotationsResource, showFilter]);

  useEffect(() => {
    setPageCount(Math.ceil(quotationsResource.total / page.pageSize));
  }, [quotationsResource, page.pageSize]);

  if (isFetched && !quotationsResource.total) {
    return (
      <EmptySection
        label="No quotations yet. Create a new one to view here"
        showActionBtn
        btnLabel="Add Quotation"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  if (isLoading) {
    return <Progress />;
  }

  return (
    <PageOverviewLayout
      label="Quotations"
      renderWidget={
        <Widget
          searchPlaceholder="Try 'QT100100'"
          getSearchValue={(val: string) => setSearch(val)}
          setShowFilter={setShowFilter}
          showFilter={showFilter}
        />
      }>
      <Fade in={showFilter} unmountOnExit>
        <Box>
          <FilterFields setShowFilter={setShowFilter}>
            <MultipleSelectCheckmarks
              label="Status"
              options={['SENT', 'DRAFT']}
              getSelectedValue={(item) => console.log(item)}
              multiple={false}
            />
          </FilterFields>
        </Box>
      </Fade>

      <>
        <DataGridLayout
          hideFooter
          rows={rows}
          columns={columns}
          loading={isFetching}
        />
        {pageCount && page.pageSize < quotationsResource.total ? (
          <CustomPagination
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
        ) : null}
      </>
    </PageOverviewLayout>
  );
};
