import {useEffect, useRef, useState} from 'react';
import {PropertyOwnerView} from 'models/propertyManager';
import {GridCellParams, GridRowsProp} from '@mui/x-data-grid';
import {DataGridLayout} from 'components/DataGridLayout';
import {EmptySection} from 'components/EmptySection';
import {useFormatDate} from 'hooks/useFormatDate';
import {makePage, createEmptyResource} from 'utils/paging-utils';
import {useQueryCustomers} from 'hooks/reactQuery/useCustomers';
import {useQueryState} from 'hooks/useQueryState';
import {useNavigate} from 'react-router-dom';
import {PageListingLayout} from 'components/PageListingLayout';
import {Widget} from 'components/Widget';
import {useCompanyXeroInfo} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import useLastSyncedItem from 'hooks/useLastSyncedItem';
import {DataSyncType} from 'models/service-company';
import {Progress} from 'components/Progress';
import {columns, makeRows} from './CustomerDataGridProps';

interface Props {
  getSelectedCustomer: (val?: PropertyOwnerView) => void;
  initialSelectedCustomer?: PropertyOwnerView;
}

const pageSize = 25;

export const NewContractCustomer = ({
  getSelectedCustomer,
  initialSelectedCustomer,
}: Props) => {
  const [selectedCustomer, setSelectedCustomer] = useState<
    PropertyOwnerView | undefined
  >(initialSelectedCustomer);

  useEffect(() => {
    if (getSelectedCustomer) {
      getSelectedCustomer(selectedCustomer);
    }
  }, [selectedCustomer]);

  const navigate = useNavigate();
  const formatDate = useFormatDate();

  const [search, setSearch] = useQueryState('searchCustomers');
  const totalCustomerRef = useRef(0);
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
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
  }, [search]);

  useEffect(() => {
    if (!isLoading) {
      setRows(makeRows(customerResource.data, formatDate));
    }
  }, [customerResource, isLoading]);

  useEffect(() => {
    setPageCount(Math.ceil(customerResource.total / page.pageSize));
  }, [customerResource, page.pageSize]);

  if (isFetched && !totalCustomerRef.current) {
    if (isIdle || isLoading) {
      return <Progress />;
    }

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
      containerStyle={{height: '63vh'}}
      renderWidget={
        <Widget
          searchPlaceholder="Search by number, name, address etc."
          getSearchValue={(val: string) => setSearch(val)}
          showActionBtn={false}
          refInput={textInput}
          defaultSearchValue={search}
          hideSearchInput={false}
          searchInputVariant="outlined"
        />
      }>
      <DataGridLayout
        height="100%"
        fullHeight={false}
        rows={rows || []}
        columns={columns(selectedCustomer?.id || '')}
        scrollToTop={search}
        loading={isFetching}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        onCellClick={(params: GridCellParams) => {
          setSelectedCustomer(params.row.customer);
        }}
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
        isEvenRowDifferentColor
        lastSyncedText={xeroInfoData?.enabled ? lastSyncedText : ''}
      />
    </PageListingLayout>
  );
};
