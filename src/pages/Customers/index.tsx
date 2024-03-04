import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {GridRowsProp} from '@mui/x-data-grid';
import {Box} from '@mui/material';
import {PageListingLayout} from 'components/PageListingLayout';
import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {FilterFields} from 'components/FilterFields';
import {Progress} from 'components/Progress';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {useQueryCustomers} from 'hooks/reactQuery/useCustomers';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {
  PropertyOwnerOrderField,
  PropertyOwnerView,
} from 'models/propertyManager';
import {getFilterUnitNumber} from 'utils/customer-utils';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {DataSyncType} from 'models/service-company';
import useLastSyncedItem from 'hooks/useLastSyncedItem';
import {useCompanyXeroInfo} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Order, OrderByParams} from 'models/misc';
import {useSearchValues} from 'hooks/useSearchValues';
import {columns, makeRows} from './CustomerDataGridProps';
import {Widget} from '../../components/Widget';

const pageSize = 25;

export const Customer = () => {
  const navigate = useNavigate();
  const formatDate = useFormatDate();

  const [search, setSearch] = useQueryState('searchCustomers');
  const [numberOfUnits, setNumberOfUnits] = useQueryState<string[]>(
    'numberOfUnits',
    {defaultValue: []},
  );
  const totalCustomerRef = useRef(0);
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);
  const textInput = useRef<HTMLInputElement>(null);

  const {values, clearValues} =
    useSearchValues<OrderByParams<PropertyOwnerOrderField>>();
  const {sortOrder, orderByField} = values;

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
      orderBy: orderByField || PropertyOwnerOrderField.CREATED_TIME,
      order: sortOrder || Order.DESC,
    },
    {keepPreviousData: true},
  );
  totalCustomerRef.current = totalCustomerRef.current || customerResource.total;

  const {user} = useUserSession();

  const {data: xeroInfoData} = useCompanyXeroInfo(
    user?.userAccount.serviceCompany.id,
  );
  const {lastSyncedText} = useLastSyncedItem({
    syncType: DataSyncType.PROPERTY_OWNER,
  });

  useEffect(() => {
    if (page.pageIndex) {
      setPage({...page, pageIndex: 0});
    }
    if (textInput.current) {
      textInput.current.value = search;
    }
  }, [search, `${numberOfUnits}`]); // hack to not re-render when number of units array reference changes

  useEffect(() => {
    if (!isLoading) {
      setRows(makeRows(customerResource.data, formatDate));
    }
  }, [customerResource, isLoading]);

  useEffect(() => {
    setPageCount(Math.ceil(customerResource.total / page.pageSize));
  }, [customerResource, page.pageSize]);

  const handleNumberOfUnitsChange = (value: string[]) => {
    setNumberOfUnits(value);
  };

  const renderFilterItems = () => (
    <FilterFields
      containerStyle={{alignSelf: 'center', height: '100%'}}
      wrapperStyle={{alignItems: 'center'}}
      onClear={clearValues}>
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
            handleNumberOfUnitsChange(item);
          }}
          multiple={false}
        />
      </Box>
    </FilterFields>
  );

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (isFetched && !totalCustomerRef.current) {
    return (
      <EmptySection
        label="No customers yet. Please click the button below to add."
        showActionBtn
        btnLabel="Add Customer"
        btnAction={() => navigate('/customers/new')}
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
          searchPlaceholder="Search by number, name, address etc."
          getSearchValue={(val: string) => setSearch(val)}
          showActionBtn
          refInput={textInput}
          btnOnClick={() => navigate('/customers/new')}
          btnLabel="New Customer"
          filterItems={renderFilterItems()}
          defaultSearchValue={search}
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
        totalRows={customerResource.total}
        lastSyncedText={xeroInfoData?.enabled ? lastSyncedText : ''}
      />
    </PageListingLayout>
  );
};

export default Customer;
