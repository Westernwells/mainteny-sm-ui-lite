import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import {GridRowsProp} from '@mui/x-data-grid';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {DataGridLayout} from 'components/DataGridLayout';
import {ServiceOrderType} from 'models/service-order';
import {InvoiceStatus, InvoiceStatusView, InvoiceView} from 'models/invoice';
import {useInvoices} from 'hooks/reactQuery/useInvoice';
import {PageOverviewLayout} from 'components/PageOverviewLayout';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {useSearchParams} from 'react-router-dom';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {columns, makeRows} from './InvoicesDataGridProps';
import {createEmptyResource, makePage} from '../../utils/paging-utils';
import {Widget} from '../../components/Widget';

const pageSize = 25;

export const Invoices = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(makePage(0, pageSize));
  const [queryParams, setQueryParams] = useSearchParams();
  const totalInvoiceRef = useRef(0);
  const [showFilter, setShowFilter] = useState(false);
  const [amount, setAmount] = useState<number[][]>([]);
  const [status, setStatus] = useState<InvoiceStatus>();
  const [serviceType, setServiceType] = useState<ServiceOrderType[]>([]);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [pageCount, setPageCount] = useState(0);

  const {
    data: invoiceResource = createEmptyResource<InvoiceView>(10),
    isLoading,
    isFetching,
    isFetched,
    isIdle,
  } = useInvoices(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      status: [InvoiceStatus.PAID, InvoiceStatus.NOT_PAID],
    },
    {amount: amount[0], status, serviceType},
    {keepPreviousData: true},
  );

  totalInvoiceRef.current = totalInvoiceRef.current || invoiceResource.total;

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);

    setPage({
      ...page,
      pageSize: Number(currentParams.pageSize),
      pageIndex: Number(currentParams.pageIndex) - 1,
    });
  }, [queryParams]);

  useEffect(() => {
    if (invoiceResource?.data) {
      setRows(makeRows(invoiceResource));
    }
  }, [invoiceResource]);

  useEffect(() => {
    if (!showFilter) {
      setAmount([]);
      setStatus(undefined);
      setServiceType([]);
    }
  }, [showFilter]);

  useEffect(() => {
    setPageCount(Math.ceil(invoiceResource.total / page.pageSize));
  }, [invoiceResource, pageSize]);

  const amountRangeConvertor = (selectedItems: string[]) => {
    const range: number[][] = [];
    selectedItems.forEach((item) => {
      switch (item) {
        case 'Below 1000 EUR':
          range.push([0, 1000]);
          break;

        case '1000 - 3000 EUR':
          range.push([1000, 3000]);
          break;

        case '3000 - 5000 EUR':
          range.push([3000, 5000]);
          break;

        case 'Above 5000 EUR':
          range.push([5000, 99999]);
          break;

        default:
          break;
      }
    });
    setAmount(range);
  };

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (isFetched && !totalInvoiceRef.current) {
    return (
      <EmptySection
        label="No invoices have been created yet. Please click the button below to create one!"
        showActionBtn
        btnLabel="Add Invoice"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  return (
    <PageOverviewLayout
      label="Invoices"
      renderWidget={
        <Widget
          searchPlaceholder="Try 'INV000001'"
          getSearchValue={(val: string) => setSearch(val)}
          setShowFilter={setShowFilter}
          showFilter={showFilter}
          showActionBtn
          btnLabel="New Invoice"
          btnOnClick={() => navigate('new')}
          hideViewOption
        />
      }>
      <Fade in={showFilter} unmountOnExit>
        <Box>
          <FilterFields setShowFilter={setShowFilter}>
            <MultipleSelectCheckmarks
              label="Invoice Date"
              options={['This Week', 'Last Week', 'Last Month']}
              getSelectedValue={(item) => console.log(item)}
              multiple={false}
            />
            <MultipleSelectCheckmarks
              label="Total Amount"
              options={[
                'Below 1000 EUR',
                '1000 - 3000 EUR',
                '3000 - 5000 EUR',
                'Above 5000 EUR',
              ]}
              getSelectedValue={(item) => amountRangeConvertor(item)}
              multiple={false}
            />
            <MultipleSelectCheckmarks
              label="Status"
              options={Object.values(InvoiceStatusView).map((value) => value)}
              getSelectedValue={(items: string[]) =>
                items.length
                  ? items[0] === 'Paid'
                    ? setStatus(InvoiceStatus.PAID)
                    : setStatus(InvoiceStatus.NOT_PAID)
                  : setStatus(undefined)
              }
              multiple={false}
            />
            <MultipleSelectCheckmarks
              label="Service Type"
              options={['Maintenance', 'Repair', 'Callout', 'Emergency']}
              getSelectedValue={(items) => {
                const value: ServiceOrderType[] = [];
                items.forEach((item) => {
                  switch (item) {
                    case 'Maintenance':
                      value.push(ServiceOrderType.REGULAR);
                      break;
                    case 'Repair':
                      value.push(ServiceOrderType.REPAIR);
                      break;
                    case 'Callout':
                      value.push(ServiceOrderType.CALLOUT);
                      break;
                    case 'Emergency':
                      value.push(ServiceOrderType.EMERGENCY);
                      break;
                    default:
                      break;
                  }
                });
                setServiceType(value);
              }}
            />
          </FilterFields>
        </Box>
      </Fade>

      <DataGridLayout
        rows={rows}
        columns={columns}
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
        totalRows={invoiceResource?.total}
      />
    </PageOverviewLayout>
  );
};
