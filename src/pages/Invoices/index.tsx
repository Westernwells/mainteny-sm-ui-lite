import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  InvoiceFilterForm,
  InvoiceOrderField,
  InvoiceStatus,
  InvoiceStatusFilter,
  InvoiceTableRow,
  InvoiceView,
  QueryInvoiceParams,
} from 'models/invoice';
import {
  useAllInvoices,
  useInvoiceComments,
  useInvoices,
  useInvoiceStatistics,
} from 'hooks/reactQuery/useInvoice';
import {useNavigate} from 'react-router-dom';
import {aggregateInvoiceRow, createSearchQuery} from 'utils/invoice';
import {Progress} from 'components/Progress';
import {useQueryState} from 'hooks/useQueryState';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {DataSyncType, ServiceCompanyNumberType} from 'models/service-company';
import {
  useCompanyJobTypes,
  useCompanyNextNumber,
  useCompanyXeroInfo,
  useOldCompanyJobTypes,
} from 'hooks/reactQuery/useCompanies';
import {useTranslation} from 'react-i18next';
import {useSearchValues} from 'hooks/useSearchValues';
import {
  calculateTotalPages,
  createEmptyResource,
  makePage,
  toggleOrder,
} from 'utils/paging';
import PageContainer from 'components/PageContainer';
import PageHeaderContainer from 'components/PageHeaderContainer';
import SearchInput from 'components/SearchInput/index';
import AddButton from 'components/AddButton';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import TableBody from 'components/Table/TableBody';
import TableRow from 'components/Table/TableRow';
import Pagination from 'components/Pagination';
import {
  ACTION_CELL_WIDTH,
  NOTES_CELL_WIDTH,
  TableColumnWithRender,
} from 'models/table';
import Cell from 'components/Table/TableCell';
import TableCellText from 'components/Table/TableCellText';
import {StatusChip} from 'components/StatusChip';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import {theme} from 'theme';
import {Checkbox, CircularProgress, Typography} from '@mui/material';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {NoteAltOutlined} from '@mui/icons-material';
import {Order, OrderByParams} from 'models/pagination';
import {Actions} from 'pages/Invoices/Actions';
import Filters from 'components/Filters';
import CustomerInput from 'components/Inputs/CustomerInput';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import TextInput from 'components/TextInput';
import ChipSelector from 'components/ChipSelector';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import {
  ServiceOrderQueryParams,
  ServiceOrderStatusFilter,
  ServiceOrderType,
} from 'models/service-order';
import {useServiceOrdersStatistics} from 'hooks/reactQuery/useServiceOrder';
import {endOfDay, startOfDay, subDays} from 'date-fns';
import QuickFilter from 'components/QuickFilter';
import {OptionWithTranslationKey} from 'models/filter';
import {capitalize, reduce} from 'lodash';
import NoteDrawer from 'pages/InvoiceDetails/Notes/NoteDrawer';
import {Avatar} from 'components/Avatar';
import {
  DEFAULT_DATE_FORMAT,
  formatDate,
  fromDateStringToDate,
  toRestDate,
} from 'utils/datetime';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {Button} from 'components/Button';
import {createExcelContent} from 'utils/utils';
import {downloadExcel} from 'utils/download';
import {useSnackbar} from 'hooks/useSnackbar';
import useLastSyncedItem from 'hooks/useLastSyncedItem';
import UnitIdInput from 'components/Inputs/UnitInput/UnitIdInput';
import CustomerIdInput from 'components/Inputs/CustomerInput/CustomerIdInput';
import ServiceOrderIdInput from 'components/Inputs/ServiceOrderInput/ServiceOrderIdInput';
import ContractIdInput from 'components/Inputs/ContractInput/ContractIdInput';
import {DateRange} from '@mui/x-date-pickers-pro';
import DatePickerRange from 'components/DatePickerRange';
import EmptyTable from 'components/Table/EmptyTable';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {formatCurrency} from 'utils/currency';
import {getInvoiceStatusStyles} from './InvoicesDataGridProps';

const pageSize = 25;

type Props = {elevatorId?: string};

const QUICK_FILTER_OPTIONS_WITHOUT_ALL: OptionWithTranslationKey[] = [
  {value: InvoiceStatusFilter.DRAFT, labelKey: 'Draft'},
  {value: InvoiceStatusFilter.NOT_PAID, labelKey: 'Sent'},
  {value: InvoiceStatusFilter.PARTIALLY_PAID, labelKey: 'Partially Paid'},
  {value: InvoiceStatusFilter.PAID, labelKey: 'Paid'},
  {value: InvoiceStatusFilter.EXPIRED, labelKey: 'Overdue'},
  {value: InvoiceStatusFilter.CREDITED, labelKey: 'Credited'},
  {value: InvoiceStatusFilter.CANCELLED, labelKey: 'Cancelled'},
];

const QUICK_FILTER_OPTIONS: OptionWithTranslationKey[] = [
  {value: InvoiceStatusFilter.ALL, labelKey: 'All'},
  ...QUICK_FILTER_OPTIONS_WITHOUT_ALL,
];

const Invoices = ({elevatorId}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();

  const {
    values: {sortOrder, orderByField},
    updateValues,
  } = useSearchValues<OrderByParams<InvoiceOrderField>>();

  const [search, setSearch] = useQueryState('searchInvoices');
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const totalInvoiceRef = useRef(0);
  const [status, setStatus] = useQueryState<InvoiceStatusFilter[]>('status', {
    defaultValue: [],
  });

  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useQueryState<
    string | undefined
  >('selectedInvoiceNumber', {defaultValue: undefined});

  const [selectedOrderNumber, setSelectedOrderNumber] = useQueryState<
    string | undefined
  >('selectedOrderNumber', {defaultValue: undefined});

  const [selectedJobTypes, setSelectedJobTypes] = useQueryState<
    ServiceOrderType[]
  >('selectedOrderTypes', {defaultValue: []});

  const [selectedCustomer, setSelectedCustomer] = useQueryState<
    string | undefined
  >('selectedCustomer', {defaultValue: undefined});

  const [selectedCustomerId, setSelectedCustomerId] = useQueryState<
    string | undefined
  >('selectedCustomerId', {defaultValue: undefined});

  const [selectedContract, setSelectedContract] = useQueryState<
    string | undefined
  >('selectedContractId', {defaultValue: undefined});

  const [selectedUnitId, setSelectedUnitId] = useQueryState<string | undefined>(
    'selectedUnitId',
    {defaultValue: undefined},
  );

  const [selectedJobId, setSelectedJobId] = useQueryState<string | undefined>(
    'selectedJobId',
    {defaultValue: undefined},
  );

  const [selectedStartDate, setSelectedStartDate] = useQueryState<
    string | undefined
  >('selectedStartDate', {
    defaultValue: undefined,
  });

  const [selectedEndDate, setSelectedEndDate] = useQueryState<
    string | undefined
  >('selectedEndDate', {
    defaultValue: undefined,
  });

  const [grossAmountMin, setGrossAmountMin] = useQueryState<number | undefined>(
    'grossAmountMin',
    {
      defaultValue: undefined,
    },
  );
  const [grossAmountMax, setGrossAmountMax] = useQueryState<number | undefined>(
    'grossAmountMax',
    {
      defaultValue: undefined,
    },
  );
  const [isWithNote, setIsWithNote] = useQueryState<string | undefined>(
    'withNote',
    {
      defaultValue: undefined,
    },
  );

  const textInput = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceView>();
  const [tempDateRange, setTempDateRange] = useState<DateRange<Date>>([
    selectedStartDate
      ? fromDateStringToDate(selectedStartDate, DEFAULT_DATE_FORMAT)
      : null,
    selectedEndDate
      ? fromDateStringToDate(selectedEndDate, DEFAULT_DATE_FORMAT)
      : null,
  ]);

  const [hoverNoteServiceId, setHoverNoteServiceId] = useState<
    string | undefined
  >();

  const query = useMemo(
    () =>
      createSearchQuery({
        search,
        orderNumber: selectedOrderNumber,
        invoiceNumber: selectedInvoiceNumber,
      }),
    [search, selectedOrderNumber, selectedInvoiceNumber],
  );

  const filters: QueryInvoiceParams = {
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    ...(query && {query}),
    status: status.includes(InvoiceStatusFilter.ALL)
      ? []
      : (status as unknown as InvoiceStatus[]), // as filter values and statuses are almost identical we can cast it instead of having a mapper
    serviceOrderTypes: selectedJobTypes,
    orderByField: orderByField || InvoiceOrderField.CREATED_DATE,
    order: sortOrder || Order.DESC,
    ...(grossAmountMin &&
      grossAmountMin > 0 && {grossAmountFrom: grossAmountMin}),
    ...(grossAmountMax &&
      grossAmountMax > 0 && {grossAmountTo: grossAmountMax}),
    ...(selectedStartDate && {
      sentDateFrom: toRestDate(
        fromDateStringToDate(selectedStartDate, DEFAULT_DATE_FORMAT),
      ),
    }),
    ...(selectedEndDate && {
      sentDateTo: toRestDate(
        fromDateStringToDate(selectedEndDate, DEFAULT_DATE_FORMAT),
      ),
    }),
    ...(isWithNote === 'true' && {hasComments: true}),
    ...(selectedCustomer && {propertyOwnerId: [selectedCustomer]}),
    ...(selectedContract && {contractIds: [selectedContract]}),
    ...((selectedUnitId || elevatorId) && {
      elevatorId: (elevatorId ? [elevatorId] : [selectedUnitId]) as string[],
    }),
  };

  const {data: companyNextNumber, refetch: refetchCompanyNextNumber} =
    useCompanyNextNumber(
      {
        type: ServiceCompanyNumberType.INVOICE,
      },
      user?.userAccount.serviceCompany.id,
      true,
    );

  const {data: jobTypes} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );
  const {data: oldJobTypes} = useOldCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  // Filter out oldJobTypes that already exist in jobTypes based on the 'name' property
  const filteredOldJobTypes = oldJobTypes?.filter(
    (oldJobType) =>
      !jobTypes?.some((jobType) => jobType.name === oldJobType.name),
  );

  const {
    data: invoiceResource = createEmptyResource<InvoiceView>(10),
    isLoading,
    isFetched,
    isIdle,
    refetch: invoiceRefetch,
  } = useInvoices(filters, {
    keepPreviousData: true,
    refetchOnWindowFocus: true,
  });

  const {data: invoiceStatistics} = useInvoiceStatistics(filters, {
    keepPreviousData: true,
  });

  const {refetch: refetchAllInvoices, isFetching: isFetchingAllInvoices} =
    useAllInvoices(filters, {
      enabled: false,
      refetchOnWindowFocus: false,
    });

  totalInvoiceRef.current = totalInvoiceRef.current || invoiceResource.total;

  const currentDate = new Date();

  const defaultStatsFilters: ServiceOrderQueryParams = {
    end: endOfDay(currentDate).toISOString(),
    start: startOfDay(subDays(currentDate, 30)).toISOString(),
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    order: sortOrder || Order.DESC,
    query: '',
  };

  const {data: serviceOrdersDefaultStatistics} = useServiceOrdersStatistics(
    defaultStatsFilters,
    {
      keepPreviousData: true,
    },
  );

  const {data: notes} = useInvoiceComments(
    hoverNoteServiceId ?? '',
    {
      pageIndex: 0,
      pageSize: 1,
    },
    {
      enabled: !!hoverNoteServiceId,
    },
  );

  const handleSortField = (fieldName: string) => {
    const order = toggleOrder(
      orderByField === fieldName ? sortOrder : undefined,
    );
    updateValues({
      orderByField: order ? (fieldName as InvoiceOrderField) : undefined, // TODO: map table column to field name
      sortOrder: order,
    });
  };

  const handleRangeChange = useCallback(() => {
    const startDate = tempDateRange?.[0] || undefined;
    const endDate = tempDateRange?.[1] || undefined;
    setSelectedStartDate(formatDate(startDate));
    setSelectedEndDate(formatDate(endDate || startDate));
  }, [tempDateRange]);

  const clearDateSelection = () => {
    setSelectedStartDate(undefined);
    setSelectedEndDate(undefined);
  };

  const {data: xeroInfoData} = useCompanyXeroInfo(
    user?.userAccount.serviceCompany.id,
  );
  const {lastSyncedText} = useLastSyncedItem({
    syncType: DataSyncType.INVOICE,
  });

  const fetchedNote = useMemo(() => {
    if (!hoverNoteServiceId) return undefined;
    return notes?.data[0];
  }, [hoverNoteServiceId, notes]);

  const handleNoteHover = (serviceOrderId: string | undefined) => () => {
    setHoverNoteServiceId(serviceOrderId);
  };

  const handleCustomerCellClick = (id: string) => () => {
    navigate(`/customers/details/${id}?tab=0`);
  };

  const {data: clientStorageData} = useQueryClientStorageData({
    serviceCompanyId: user?.userAccount.serviceCompany.id!,
    params: {key: 'pdf-template'},
  });

  const headerInfo = JSON.parse(clientStorageData?.value || '{}').header;
  const footerInfo = JSON.parse(clientStorageData?.value || '{}').footer;

  const {data: headerUrl = {}, isLoading: isHeaderUrlLoading} = useDownloadUrl(
    headerInfo?.path ? [headerInfo?.path] : [],
    undefined,
    user?.userAccount.serviceCompany.id,
  );

  const {data: footerUrl = {}, isLoading: isFooterUrlLoading} = useDownloadUrl(
    footerInfo?.path ? [footerInfo?.path] : [],
    undefined,
    user?.userAccount.serviceCompany.id,
  );

  const COLUMNS = useMemo<TableColumnWithRender<InvoiceTableRow>[]>(
    () => [
      {
        headerName: 'Number',
        key: 'invoice-cell-number',
        width: '124px',
        isFirst: true,
        fieldName: InvoiceOrderField.NUMBER,
        getExportValue: (invoice) => invoice.number,
        showShadows: showRightShadow ? 'right' : undefined,
        renderCell: (invoice, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{invoice.number || '-'}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Customer',
        key: 'invoice-cell-customer',
        fieldName: InvoiceOrderField.CUSTOMER_NAME,
        getExportValue: (invoice) => invoice.propertyOwner.name,
        renderCell: (invoice, cellProps) => (
          <Cell
            {...cellProps}
            onClick={handleCustomerCellClick(invoice.propertyOwner.id)}>
            <Avatar
              labelStyles={{
                color: theme.palette.primary.light,
              }}
              key={`company-avatar-${invoice.propertyOwner.id}`}
              userAccount={{firstName: invoice.propertyOwner.name}}
            />
          </Cell>
        ),
      },
      {
        headerName: 'Invoice date',
        key: 'invoice-cell-date',
        width: '124px',
        align: 'right',
        fieldName: InvoiceOrderField.CREATED_DATE,
        getExportValue: (invoice) => formatDate(invoice.date) ?? '',
        renderCell: (invoice, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {invoice.date ? formatDate(invoice.date) : '-'}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Due date',
        key: 'invoice-cell-due-date',
        width: '112px',
        align: 'right',
        fieldName: InvoiceOrderField.DUE_DATE,
        getExportValue: (invoice) => formatDate(invoice.dueDate) ?? '',
        renderCell: (invoice, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Job number',
        key: 'invoice-cell-job-number',
        fieldName: InvoiceOrderField.SERVICE_ORDER_EXTERNAL_ID,
        getExportValue: (invoice) => invoice.jobNumber,
        renderCell: (invoice, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{invoice.jobNumber}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Invoice type',
        key: 'invoice-cell-type',
        width: '136px',
        fieldName: InvoiceOrderField.TYPE,
        getExportValue: (invoice) => t(invoice.type),
        renderCell: (invoice, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{t(invoice.type)}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Job Type',
        key: 'invoice-cell-service-type',
        width: '136px',
        fieldName: InvoiceOrderField.SERVICE_ORDER_TYPE,
        getExportValue: (invoice) => {
          if (!invoice.serviceOrderType) return '';
          return serviceOrderTypeToString(invoice.serviceOrderType) === '-'
            ? invoice.serviceOrderType
            : t(serviceOrderTypeToString(invoice.serviceOrderType));
        },
        renderCell: (invoice, cellProps) => (
          <Cell {...cellProps}>
            <Box
              display="flex"
              alignItems="flex-end"
              gap="0.5rem"
              sx={{width: '100%'}}>
              <ServiceOrderIcons
                serviceOrderType={invoice.serviceOrderType}
                size="small"
              />
              <ServiceOrderTypeText
                serviceOrderType={invoice.serviceOrderType}
                capitalizeText
                variant="body2"
                noWrap
              />
            </Box>
          </Cell>
        ),
      },
      {
        headerName: 'Total (incl. VAT)',
        key: 'invoice-cell-total',
        width: '186px',
        align: 'right',
        fieldName: InvoiceOrderField.TOTAL_NET_AMOUNT,
        getExportValue: (invoice) => `${invoice.total}`,
        renderCell: (invoice, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{formatCurrency(invoice.total)}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Status',
        key: 'invoice-cell-status',
        align: 'center',
        width: '136px',
        fieldName: InvoiceOrderField.STATUS,
        getExportValue: (invoice) =>
          t(getInvoiceStatusStyles(invoice.status).label),
        renderCell: (invoice, cellProps) => (
          <Cell {...cellProps}>
            <StatusChip
              label={getInvoiceStatusStyles(invoice.status).label}
              color={getInvoiceStatusStyles(invoice.status).color}
              maxChars={8}
            />
          </Cell>
        ),
      },
      {
        headerName: 'NOTES',
        key: 'invoice-cell-notes',
        width: NOTES_CELL_WIDTH,
        align: 'center',
        renderCell: (invoice, cellProps) => (
          <Cell
            {...cellProps}
            fieldName="NOTES"
            noWidthLimit
            onClick={() => setSelectedInvoice(invoice.data)}>
            {invoice.hasComments ? (
              <Tooltip
                onMouseEnter={handleNoteHover(invoice.id)}
                onMouseLeave={handleNoteHover(undefined)}
                title={
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    gap={theme.spacing(0.5)}>
                    <Typography
                      sx={{
                        color: '#BDBDBD',
                        lineHeight: '14px',
                        fontSize: '10px',
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                      }}>
                      {formatDate(fetchedNote?.meta.lastUpdatedAt)}
                    </Typography>
                    <Typography
                      sx={{
                        lineHeight: '14px',
                        fontSize: '10px',
                      }}>
                      {fetchedNote?.content}
                    </Typography>
                  </Box>
                }
                arrow
                placement="top">
                <NoteAlt fontSize="small" />
              </Tooltip>
            ) : (
              <NoteAltOutlined fontSize="small" />
            )}
          </Cell>
        ),
      },
      {
        headerName: 'action',
        key: 'invoice-cell-action',
        isHeaderNameHidden: true,
        align: 'center',
        width: ACTION_CELL_WIDTH,
        isLast: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        noPadding: true,
        renderCell: (invoice, cellProps) => (
          <Cell {...cellProps} onClick={undefined}>
            <Actions
              invoice={invoice.data}
              headerInfo={headerInfo}
              footerInfo={footerInfo}
              headerUrl={headerUrl}
              footerUrl={footerUrl}
              companyNextNumber={companyNextNumber}
              refetchCompanyNextNumber={refetchCompanyNextNumber}
              isHeaderUrlLoading={isHeaderUrlLoading}
              isFooterUrlLoading={isFooterUrlLoading}
              removePadding
            />
          </Cell>
        ),
      },
    ],
    [
      fetchedNote,
      companyNextNumber,
      refetchCompanyNextNumber,
      headerInfo,
      footerInfo,
      headerUrl,
      footerUrl,
      companyNextNumber,
      isHeaderUrlLoading,
      isFooterUrlLoading,
      showLeftShadow,
      showRightShadow,
    ],
  );

  // filter intermediate state
  const {handleSubmit, setValue, watch, control} = useForm<InvoiceFilterForm>({
    defaultValues: {
      number: selectedInvoiceNumber,
      customer: selectedCustomer,
      customerId: selectedCustomerId,
      orderNumber: selectedOrderNumber,
      jobTypes: selectedJobTypes ?? [],
      unitId: selectedUnitId,
      jobId: selectedJobId,
      contractId: selectedContract,
      grossAmountMin,
      grossAmountMax,
      hasComment: isWithNote === 'true',
    },
    mode: 'all',
  });

  const watchJobTypes = watch('jobTypes');
  const watchCustomer = watch('customer');
  const watchContractId = watch('contractId');
  const watchUnitId = watch('unitId');
  const watchJobId = watch('jobId');
  const watchHasComment = watch('hasComment');
  const watchGrossMin = watch('grossAmountMin');
  const watchGrossMax = watch('grossAmountMax');

  const totalPages = useMemo(
    () =>
      calculateTotalPages(invoiceResource.total, invoiceResource.page.pageSize),
    [invoiceResource],
  );

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleRowClick = (id: string) => () => {
    navigate(`/invoices/details/${id}`);
  };

  useEffect(() => {
    if (invoiceResource.total > 0 && invoiceResource.data.length === 0) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
  }, [search, status, invoiceResource]);

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = search;
    }
  }, []);

  useEffect(() => {
    if (textInput.current) {
      textInput.current.value = search ?? '';
    }
  }, [search]);

  const rows = useMemo(
    () => aggregateInvoiceRow(invoiceResource.data),
    [invoiceResource],
  );

  const navigateToNewInvoice = () => {
    navigate('/invoices/new');
  };

  const handleQuickFilterChange = (value: string) => {
    // when selecting ALL values remove all other selections
    if (value === 'ALL') {
      setStatus([InvoiceStatusFilter.ALL]);
      return;
    }

    const newValues = status.some((option) => option === value)
      ? status.filter((option) => option !== value)
      : [...status, value];

    // remove the ALL status if any other status is selected
    if (newValues.length > 1 && newValues.includes('ALL')) {
      setStatus(
        newValues.filter(
          (selectedValues) => selectedValues !== 'ALL',
        ) as InvoiceStatusFilter[],
      );
      return;
    }

    const areAllValuesSelectedIndividually =
      QUICK_FILTER_OPTIONS_WITHOUT_ALL.every((option) =>
        newValues.some((selectedValue) => option.value === selectedValue),
      );

    setStatus(
      areAllValuesSelectedIndividually
        ? [InvoiceStatusFilter.ALL]
        : (newValues as InvoiceStatusFilter[]),
    );
  };

  const handleExport = async () => {
    try {
      // Initiate the export process by fetching all filtered service orders
      const {data} = await refetchAllInvoices();

      if (!data || data.length === 0) {
        return;
      }

      const excludedFields = ['invoice-cell-notes', 'invoice-cell-action'];

      const filteredColumns = COLUMNS.filter(
        (col) => !excludedFields.includes(col.key),
      );

      const headers = filteredColumns.map((col) =>
        capitalize(t(col.headerName)),
      );

      const dataRows = aggregateInvoiceRow(data).map((invoice) =>
        filteredColumns.map((col) => col.getExportValue?.(invoice) || ''),
      );

      const filename = 'Invoices';

      const excelContent = createExcelContent({
        headers,
        rows: dataRows,
        sheetName: filename,
      });

      downloadExcel({excelContent, filename});
    } catch (error) {
      console.error('Error exporting Excel:', error);
      enqueueSnackbar(t('Failed to export Excel'), {variant: 'error'});
    }
  };

  const handleFilterApply: SubmitHandler<InvoiceFilterForm> = (data) => {
    setSelectedInvoiceNumber(data.number);
    setSelectedCustomer(data.customer);
    setSelectedCustomerId(data.customerId);
    setSelectedContract(data.contractId);
    setSelectedUnitId(data.unitId);
    setSelectedJobId(data.jobId);
    setSelectedOrderNumber(data.orderNumber);
    setSelectedJobTypes(data.jobTypes);
    setGrossAmountMin(data.grossAmountMin);
    setGrossAmountMax(data.grossAmountMax);
    setIsWithNote(data.hasComment ? 'true' : undefined);
  };

  const handleFilterOpen = () => {
    setValue('number', selectedInvoiceNumber);
    setValue('customer', selectedCustomer);
    setValue('customerId', selectedCustomerId);
    setValue('contractId', selectedContract);
    setValue('unitId', selectedUnitId);
    setValue('jobId', selectedJobId);
    setValue('orderNumber', selectedOrderNumber);
    setValue('jobTypes', selectedJobTypes ?? []);
    setValue('grossAmountMin', grossAmountMin);
    setValue('grossAmountMax', grossAmountMax);
    setValue('hasComment', isWithNote === 'true');
  };

  const handleFilterReset = () => {
    setValue('number', undefined);
    setValue('customer', undefined);
    setValue('customerId', undefined);
    setValue('contractId', undefined);
    setValue('unitId', undefined);
    setValue('jobId', undefined);
    setValue('orderNumber', undefined);
    setValue('jobTypes', []);
    setValue('grossAmountMin', undefined);
    setValue('grossAmountMax', undefined);
    setValue('hasComment', undefined);
  };

  const appliedFilterNumber = useMemo(
    () =>
      [
        selectedInvoiceNumber,
        selectedCustomer,
        selectedCustomerId,
        selectedContract,
        selectedUnitId,
        selectedJobId,
        selectedOrderNumber,
        isWithNote,
      ].filter((field) => !!field).length +
      [grossAmountMin, grossAmountMax].filter((field) => !!field && field > 0)
        .length +
      [selectedJobTypes].filter((field) => field.length > 0).length,
    [
      selectedInvoiceNumber,
      selectedCustomer,
      selectedCustomerId,
      selectedContract,
      selectedUnitId,
      selectedJobId,
      selectedOrderNumber,
      selectedJobTypes,
      grossAmountMin,
      grossAmountMax,
      isWithNote,
    ],
  );

  // Combine jobTypes and the filtered oldJobTypes
  const allJobTypes = [...(jobTypes || []), ...(filteredOldJobTypes || [])];

  const filteredJobTypes = useMemo(() => {
    const jobTypesInStatistics =
      serviceOrdersDefaultStatistics?.numOfServiceOrdersPerType
        ? Object.keys(
            serviceOrdersDefaultStatistics.numOfServiceOrdersPerType,
          ).filter(
            (jobType) =>
              serviceOrdersDefaultStatistics.numOfServiceOrdersPerType[
                jobType
              ] > 0,
          )
        : [];

    return allJobTypes?.filter((job) =>
      jobTypesInStatistics.includes(job.name),
    );
  }, [serviceOrdersDefaultStatistics, allJobTypes]);

  const aggregatedServiceOrderStatistics = useMemo(() => {
    if (!invoiceStatistics) return undefined;

    return reduce(
      invoiceStatistics.numOfInvoicesPerStatus,
      (acc: Record<string, number>, amount, currentStatus) => {
        acc[currentStatus] = (acc[currentStatus] ?? 0) + amount;
        acc[ServiceOrderStatusFilter.ALL] =
          (acc[ServiceOrderStatusFilter.ALL] ?? 0) + amount;
        return acc;
      },
      {},
    );
  }, [invoiceStatistics]);

  const handleJobTypesChange = useCallback(
    (value: string) => {
      if (!watchJobTypes.some((type) => type === value)) {
        setValue('jobTypes', [...watchJobTypes, value as ServiceOrderType]);
      } else {
        setValue(
          'jobTypes',
          watchJobTypes.filter((type) => type !== value),
        );
      }
    },
    [watchJobTypes],
  );

  const {emptyTable, noMatchingData} = useMemo(() => {
    if (!isFetched) return {emptyTable: false, noMatchingData: false};

    if (
      (appliedFilterNumber > 0 ||
        status.length > 0 ||
        selectedStartDate ||
        selectedEndDate ||
        !!search) &&
      invoiceResource.total === 0
    ) {
      return {emptyTable: false, noMatchingData: true};
    }

    // when the user does not have filters applied and there are no entries for the table
    if (invoiceResource.total === 0) {
      return {emptyTable: true, noMatchingData: false};
    }

    return {emptyTable: false, noMatchingData: false};
  }, [appliedFilterNumber, isFetched, invoiceResource]);

  const showXeroInfoRender = () => (
    <Box>{xeroInfoData?.enabled ? lastSyncedText : ''}</Box>
  );

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (emptyTable) {
    return (
      <EmptyTable
        illustration="invoice"
        label="No invoices"
        subLabel="Create a new invoice and send it over to your clients."
        btnLabel="New Invoice"
        onClick={navigateToNewInvoice}
      />
    );
  }

  return (
    <>
      <PageContainer gap={3}>
        <PageHeaderContainer>
          <Box
            sx={{
              display: 'flex',
            }}
            gap={2}>
            <SearchInput
              refInput={textInput}
              defaultValue={search}
              onChange={(val: string) => setSearch(val)}
            />
            <DatePickerRange
              defaultDate={tempDateRange}
              getSelectedDate={setTempDateRange}
              onAccept={handleRangeChange}
              textFieldProps={{
                label: '',
                sx: {
                  width: '100%',
                },
              }}
              containerStyles={{
                '& .MuiStack-root': {
                  padding: 0,
                },
              }}
              onClear={clearDateSelection}
            />
            <Filters
              activeFilters={appliedFilterNumber}
              onOpen={handleFilterOpen}
              onSave={handleSubmit(handleFilterApply)}
              onReset={handleFilterReset}>
              <Box sx={{display: 'flex', flexDirection: 'column'}} gap={2}>
                <Controller
                  control={control}
                  name="number"
                  render={({field: {value, onChange}}) => (
                    <TextInput
                      value={value}
                      onChange={onChange}
                      size="small"
                      labelKey="Invoicing number"
                      placeholder="Search invoice number"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="jobTypes"
                  render={() => (
                    <ChipSelector
                      headerLabel="Job Type"
                      options={filteredJobTypes.map((jobType) => ({
                        value: jobType.name,
                        labelKey:
                          serviceOrderTypeToString(jobType.name) === '-'
                            ? jobType.name
                            : serviceOrderTypeToString(jobType.name),
                      }))}
                      selectedChips={watchJobTypes}
                      onChange={handleJobTypesChange}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="customer"
                  render={({field}) => (
                    <CustomerInput
                      selectedValue={watchCustomer}
                      isSetValueFromParent
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="orderNumber"
                  render={({field: {value, onChange}}) => (
                    <TextInput
                      value={value}
                      onChange={onChange}
                      size="small"
                      labelKey="Perchase order number"
                      placeholder="Search job number"
                    />
                  )}
                />

                <Box sx={{display: 'flex'}} gap={2}>
                  <Controller
                    control={control}
                    name="customer"
                    render={({field}) => (
                      <CustomerIdInput
                        selectedValue={watchCustomer}
                        isSetValueFromParent
                        onChange={field.onChange}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="unitId"
                    render={({field}) => (
                      <UnitIdInput
                        selectedValue={watchUnitId}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Box>

                <Box sx={{display: 'flex'}} gap={2}>
                  <Controller
                    control={control}
                    name="jobId"
                    render={({field}) => (
                      <ServiceOrderIdInput
                        selectedValue={watchJobId}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="contractId"
                    render={({field}) => (
                      <ContractIdInput
                        selectedValue={watchContractId}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Box>

                <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
                  <Typography variant="subtitle2">
                    {t('Gross amount')}
                  </Typography>

                  <Box sx={{display: 'flex'}} gap={1}>
                    <Controller
                      control={control}
                      name="grossAmountMin"
                      render={({field}) => (
                        <TextInput
                          value={watchGrossMin ? `${watchGrossMin}` : ''}
                          placeholder="Min"
                          size="small"
                          styles={{
                            '& .MuiInputBase-input': {
                              textAlign: 'end',
                            },
                          }}
                          onChange={field.onChange}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="grossAmountMax"
                      render={({field}) => (
                        <TextInput
                          value={watchGrossMax ? `${watchGrossMax}` : ''}
                          placeholder="Max"
                          size="small"
                          styles={{
                            '& .MuiInputBase-input': {
                              textAlign: 'end',
                            },
                          }}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  gap={1}>
                  <Typography variant="subtitle2">
                    {t('Invoice(s) with notes')}
                  </Typography>
                  <Controller
                    control={control}
                    name="hasComment"
                    render={({field}) => (
                      <Checkbox
                        data-testid="invoice-filter-note-checkbox"
                        checked={watchHasComment}
                        onChange={field.onChange}
                        sx={{padding: 0}}
                      />
                    )}
                  />
                </Box>
              </Box>
            </Filters>
          </Box>
          <Box display="flex" gap={2}>
            {rows.length > 0 && (
              <Button
                buttonProps={{
                  size: 'medium',
                  variant: 'outlined',
                  color: 'primary',
                  onClick: handleExport,
                  disabled: isFetchingAllInvoices,
                }}
                style={{
                  borderColor: 'text.primary',
                  height: '36px',
                }}>
                {isFetchingAllInvoices ? (
                  <CircularProgress size="1rem" sx={{mr: 1}} />
                ) : null}
                <Box pt={0.5}>{t('Export')}</Box>
              </Button>
            )}
            <AddButton label="New Invoice" onClick={navigateToNewInvoice} />
          </Box>
        </PageHeaderContainer>
        <Box>
          <QuickFilter
            selected={status ?? null}
            options={QUICK_FILTER_OPTIONS}
            statistics={aggregatedServiceOrderStatistics}
            onChange={handleQuickFilterChange}
          />
        </Box>
        <TableContainer
          showNoMatchWarning={noMatchingData}
          containerRef={containerRef}
          setShowLeftShadow={setShowLeftShadow}
          setShowRightShadow={setShowRightShadow}>
          <TableHeader
            columns={COLUMNS}
            sortState={{columnName: orderByField, order: sortOrder}}
            onSort={handleSortField}
          />
          <TableBody>
            {/* Row */}
            {rows.map((entry, index) => (
              <TableRow
                rowIndex={index}
                key={`invoice-row-${entry.id}`}
                testId={`invoice-row-${entry.id}`}>
                {COLUMNS.map(({renderCell, ...rest}) =>
                  renderCell(entry, {
                    onClick: handleRowClick(entry.id),
                    ...rest,
                  }),
                )}
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
        <Pagination
          currentIndex={invoiceResource.page.pageIndex}
          numberOfElementsPerPage={invoiceResource.page.pageSize}
          totalEntries={invoiceResource.total}
          totalPages={totalPages}
          afterPageSelectorComponent={showXeroInfoRender}
          onChange={handlePageIndexChange}
          onNumberPerPageChange={handleChangeElementsPerPage}
        />
      </PageContainer>

      {selectedInvoice && (
        <NoteDrawer
          open
          invoice={selectedInvoice}
          setOpen={() => setSelectedInvoice(undefined)}
          onChange={invoiceRefetch}
        />
      )}
    </>
  );
};

export default Invoices;
