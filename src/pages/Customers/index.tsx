import {useEffect, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {GridRowsProp} from '@mui/x-data-grid';
import {Box} from '@mui/material';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
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
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {Widget} from '../../components/Widget';
import {columns, makeRows} from './CustomerDataGridProps';

const pageSize = 25;

export const Customer = () => {
  const navigate = useNavigate();
  const formatDate = useFormatDate();

  const [search, setSearch] = useQueryState('searchCustomers');
  const [numberOfUnits, setNumberOfUnits] = useState<string[]>([]);
  const [queryParams, setQueryParams] = useSearchParams();
  const totalCustomerRef = useRef(0);
  const [page, setPage] = useState(makePage(0, pageSize));
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const textInput = useRef<HTMLInputElement>(null);

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
    if (page.pageIndex) {
      setQueryParams(formatSearchParamsPageIndex(1, queryParams));
    }
    if (textInput.current) {
      textInput.current.value = search;
    }
  }, [search, numberOfUnits]);

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
      setRows(makeRows(customerResource.data, formatDate));
    }
  }, [customerResource, isLoading]);

  useEffect(() => {
    setPageCount(Math.ceil(customerResource.total / page.pageSize));
  }, [customerResource, page.pageSize]);

  useEffect(() => {
    Mixpanel.identifyAndTrack(mixpanelEvents.CUSTOMERS_VIEW, {
      pageName: 'Customers',
    });
  }, []);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (isFetched && !totalCustomerRef.current) {
    return (
      <EmptySection
        label="No customers yet. Please click the button below to add."
        showActionBtn
        btnLabel="Add Customer"
        btnAction={() => {
          Mixpanel.identifyAndTrack(mixpanelEvents.NEW_CUSTOMER_BUTTON_CLICKED);
          navigate('/customers/new');
        }}
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
    if (textInput.current) {
      textInput.current.value = '';
    }
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
          options={['0 - 5', '5 - 20', '20 - 100', '100+']}
          containerStyles={{
            minWidth: '21.875em',
            marginRight: '0.438em',
            alignItems: 'center',
          }}
          formControlStyles={{
            width: '100%',
          }}
          initialSelectedItems={numberOfUnits}
          getSelectedValue={(item) => {
            Mixpanel.identifyAndTrack(mixpanelEvents.CUSTOMERS_FILTER_CLICK, {
              pageName: 'Customers',
              noOfUnits: item,
              time: 0,
              searchBar: 0,
              source: 'List View',
            });
            handleNumberOfUnitsChange(item);
          }}
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
          refInput={textInput}
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

export default Customer;
