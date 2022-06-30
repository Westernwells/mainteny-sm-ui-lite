import {useEffect, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {GridRowsProp} from '@mui/x-data-grid';
import {Box} from '@mui/material';

import {PageListingLayout} from 'components/PageListingLayout';
import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {FilterFields} from 'components/FilterFields';
import {Progress} from 'components/Progress';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {useQueryCustomers} from 'hooks/reactQuery/useCustomers';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {PropertyOwnerView} from 'models/propertyManager';
import {getFilterUnitNumber} from 'utils/customer-utils';
import {Widget} from '../../components/Widget';
import {columns, makeRows} from './CustomerDataGridProps';

const pageSize = 25;

export const Customer = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [numberOfUnits, setNumberOfUnits] = useState<string[]>([]);
  const [queryParams, setQueryParams] = useSearchParams();
  const totalCustomerRef = useRef(0);
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {
    data: customerResource = createEmptyResource<PropertyOwnerView>(pageSize),
    isLoading,
    isFetching,
    isFetched,
    isIdle,
  } = useQueryCustomers(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      ...(numberOfUnits[0] && {
        unitNumberStart: getFilterUnitNumber(numberOfUnits[0], 'start'),
      }),
      ...(numberOfUnits[0] && {
        unitNumberEnd: getFilterUnitNumber(numberOfUnits[0], 'end'),
      }),
    },
    {keepPreviousData: true},
  );
  totalCustomerRef.current = totalCustomerRef.current || customerResource.total;

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
      setRows(makeRows(customerResource.data));
    }
  }, [customerResource, isLoading]);

  useEffect(() => {
    setPageCount(Math.ceil(customerResource.total / page.pageSize));
  }, [customerResource, page.pageSize]);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (isFetched && !totalCustomerRef.current) {
    return (
      <EmptySection
        label="No customers have been created yet. Please click the button below to create one!"
        showActionBtn
        btnLabel="Add Customer"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  const handleNumberOfUnitsChange = (value: string[]) => {
    setNumberOfUnits(value);
  };

  const handleClearFilters = () => {
    setSearch('');
    setNumberOfUnits([]);
  };

  const renderFilterItems = () => (
    <FilterFields
      containerStyle={{alignSelf: 'center', height: '100%'}}
      wrapperStyle={{alignItems: 'center'}}
      onClear={handleClearFilters}>
      <Box
        sx={{
          minWidth: '21.875em',
          marginRight: '0.438em',
          alignItems: 'center',
        }}>
        <MultipleSelectCheckmarks
          label="No. of Units"
          options={['0 - 500', '500 - 1000', '1000 - 5000', '> 5000']}
          containerStyles={{
            minWidth: '21.875em',
            marginRight: '0.438em',
            alignItems: 'center',
          }}
          formControlStyles={{
            width: '100%',
          }}
          initialSelectedItems={numberOfUnits}
          getSelectedValue={(item) => handleNumberOfUnitsChange(item)}
          multiple={false}
        />
      </Box>
    </FilterFields>
  );

  return (
    <PageListingLayout
      renderWidget={
        <Widget
          searchPlaceholder="Search by number, name, address etc."
          getSearchValue={(val: string) => setSearch(val)}
          showActionBtn
          btnOnClick={() => navigate('/customers/new')}
          btnLabel="New Customer"
          filterItems={renderFilterItems()}
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
        totalRows={customerResource.total}
      />
    </PageListingLayout>
  );
};
