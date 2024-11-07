import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {useNavigate} from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import {useQueryState} from 'hooks/useQueryState';
import {Box, Checkbox, TableBody, Tooltip, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useSearchValues} from 'hooks/useSearchValues';
import {
  calculateTotalPages,
  createEmptyResource,
  makePage,
  toggleOrder,
} from 'utils/paging';
import {
  usePurchaseInvoiceStatistics,
  usePurchaseInvoices,
} from 'hooks/reactQuery/usePurchaseInvoice';
import {
  PurchaseInvoiceFilterForm,
  PurchaseInvoiceFilterToStatusMap,
  PurchaseInvoiceOrderField,
  PurchaseInvoiceStatus,
  PurchaseInvoiceTableRow,
  PurchaseInvoiceView,
  QueryPurchaseInvoiceParams,
} from 'models/purchaseInvoice';
import PageHeaderContainer from 'components/PageHeaderContainer';
import SearchInput from 'components/SearchInput/index';
import TableHeader from 'components/Table/TableHeader';
import QuickFilter from 'components/QuickFilter';
import PageContainer from 'components/PageContainer';
import {Button} from 'components/Button';
import {OptionWithTranslationKey} from 'models/filter';
import {ACTION_CELL_WIDTH, TableColumnWithRender} from 'models/table';
import TableCellText from 'components/Table/TableCellText';
import Cell from 'components/Table/TableCell';
import {theme} from 'theme';
import {NoteAlt, NoteAltOutlined} from '@mui/icons-material';
import TableRow from 'components/Table/TableRow';
import {
  aggregatePurchaseInvoiceRow,
  createPurchaseInvoiceSearchQuery,
  getPurchaseInvoiceStatusColor,
  purchaseInvoiceStatusToString,
} from 'utils/purchaseInvoice';
import Pagination from 'components/Pagination';
import TableContainer from 'components/Table/TableContainer';
import {Progress} from 'components/Progress';
import EmptyTable from 'components/Table/EmptyTable';
import DatePickerRange from 'components/DatePickerRange';
import {DateRange} from '@mui/x-date-pickers-pro';
import {endOfDay, startOfDay, subDays, subYears} from 'date-fns';
import {StatusChip} from 'components/StatusChip';
import {formatDate} from 'utils/datetime';
import Filters from 'components/Filters';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import TextInput from 'components/TextInput';
import {ServiceOrderOrderField} from 'models/service-order';
import {DatePicker} from 'components/DatePicker';
import {reduce} from 'lodash';
import ChipSelector from 'components/ChipSelector';
import DashboardMetrics from './DashboardMetrics';
import {Order, OrderByParams} from '../../models/pagination';
import Actions from './Actions';

const pageSize = 25;

const getCommonLinkStyles = () => ({
  paddingTop: '0.2em',
  display: 'block',
  fontWeight: '600',
  maxWidth: '300px',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textWrap: 'wrap',
  fontSize: '0.95rem',
  color: '#0092B2',
});

const QUICK_FILTER_OPTIONS_WITHOUT_ALL: OptionWithTranslationKey[] = [
  {value: PurchaseInvoiceStatus.NEW, labelKey: 'New'},
  {value: PurchaseInvoiceStatus.REJECTED, labelKey: 'Not approved'},
  {value: PurchaseInvoiceStatus.APPROVED, labelKey: 'Approved'},
  {value: PurchaseInvoiceStatus.PAID, labelKey: 'Paid'},
  {value: PurchaseInvoiceStatus.OVERDUE, labelKey: 'Overdue'},
  {value: PurchaseInvoiceStatus.ARCHIVED, labelKey: 'Archived'},
];

export const QUICK_FILTER_OPTIONS: OptionWithTranslationKey[] = [
  {value: PurchaseInvoiceStatus.ALL, labelKey: 'All'},
  ...QUICK_FILTER_OPTIONS_WITHOUT_ALL,
];

type Props = {
  serviceOrderId?: string;
  hideFilters?: boolean;
};

export const PurchaseInvoices = ({
  serviceOrderId,
  hideFilters = false,
}: Props) => {
  const {t} = useTranslation();

  const navigate = useNavigate();
  const currentDate = new Date();

  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange<Date | null>
  >([null, null]);

  const [searchQuery, setSearchQuery] = useQueryState('searchPurchaseInvoices');
  const [selectedPurchaseInvoiceStatus, setSelectedPurchaseInvoiceStatus] =
    useQueryState<PurchaseInvoiceStatus[]>('selectedPurchaseInvoiceStatus', {
      defaultValue: [],
    });
  const [initialLoadNoEntries, setInitialLoadNoEntries] = useState<
    boolean | undefined
  >();

  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });

  const textInput = useRef<HTMLInputElement>(null);

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    values: {sortOrder, orderByField},
    updateValues,
  } = useSearchValues<OrderByParams<PurchaseInvoiceOrderField>>();

  const handleSortField = (fieldName: string) => {
    const order = toggleOrder(
      orderByField === fieldName ? sortOrder : undefined,
    );
    updateValues({
      orderByField: order
        ? (fieldName as PurchaseInvoiceOrderField)
        : undefined,
      sortOrder: order,
    });
  };

  const handleRowClick = (id: string) => () => {
    navigate(`/purchase-invoices/details/${id}`);
  };

  const [resetDatePicker, setResetDatePicker] = useState(false);

  const [supplierId, setSupplierId] = useQueryState<string | undefined>(
    'supplierId',
    {
      defaultValue: '',
    },
  );
  const [supplierName, setSupplierName] = useQueryState<string | undefined>(
    'supplierName',
    {
      defaultValue: '',
    },
  );
  const [subject, setSubject] = useQueryState<string | undefined>('subject', {
    defaultValue: '',
  });
  const [purchaseInvoiceNumber, setPurchaseInvoiceNumber] = useQueryState<
    string | undefined
  >('purchaseInvoiceNumber', {
    defaultValue: '',
  });
  const [sentDateFrom, setSentDateFrom] = useQueryState<Date | string | null>(
    'sentDateFrom',
    {
      defaultValue: null,
      isDate: true,
    },
  );
  const [sentDateTo, setSentDateTo] = useQueryState<Date | string | null>(
    'sentDateTo',
    {
      defaultValue: null,
      isDate: true,
    },
  );
  const [netAmountMin, setNetAmountMin] = useQueryState<number | undefined>(
    'netAmountMin',
    {
      defaultValue: undefined,
    },
  );
  const [netAmountMax, setNetAmountMax] = useQueryState<number | undefined>(
    'netAmountMax',
    {
      defaultValue: undefined,
    },
  );
  const [isWithAttachments, setIsWithAttachments] = useQueryState<
    string | undefined
  >('withAttachments', {
    defaultValue: undefined,
  });

  const [appliedFilters, setAppliedFilters] = useState({
    purchaseInvoiceNumber,
    supplierId,
    supplierName,
    subject,
    netAmountMin,
    netAmountMax,
    selectedPurchaseInvoiceStatus: selectedPurchaseInvoiceStatus.filter(
      (status) => status !== PurchaseInvoiceStatus.ALL,
    ) as (
      | PurchaseInvoiceStatus.NEW
      | PurchaseInvoiceStatus.APPROVED
      | PurchaseInvoiceStatus.REJECTED
      | PurchaseInvoiceStatus.OVERDUE
      | PurchaseInvoiceStatus.PAID
      | PurchaseInvoiceStatus.ARCHIVED
    )[],
    sentDateFrom,
    sentDateTo,
    isWithAttachments,
  });

  const filters: QueryPurchaseInvoiceParams = {
    createdDateTimeTo: endOfDay(currentDate).toISOString(),
    createdDateTimeFrom: startOfDay(subDays(currentDate, 30)).toISOString(),
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    query: createPurchaseInvoiceSearchQuery({
      search: searchQuery,
      supplierId,
      supplierName,
      subject,
      purchaseInvoiceNumber,
    }),
    status: selectedPurchaseInvoiceStatus.includes(PurchaseInvoiceStatus.ALL)
      ? []
      : selectedPurchaseInvoiceStatus
          .flatMap(
            (status) => PurchaseInvoiceFilterToStatusMap.get(status) || [],
          )
          .filter(
            (status): status is PurchaseInvoiceStatus => status !== undefined,
          ),
    orderBy: orderByField || ServiceOrderOrderField.CREATED_TIME,
    order: sortOrder || Order.DESC,
    ...(sentDateFrom instanceof Date &&
      !Number.isNaN(sentDateFrom.getTime()) && {
        sentDateFrom: startOfDay(sentDateFrom).toISOString().split('T')[0],
      }),
    ...(sentDateTo instanceof Date &&
      !Number.isNaN(sentDateTo.getTime()) && {
        sentDateTo: endOfDay(sentDateTo).toISOString().split('T')[0],
      }),
    ...(isWithAttachments && {hasDocuments: isWithAttachments}),
    ...(netAmountMin && netAmountMin > 0 && {netAmountFrom: netAmountMin}),
    ...(netAmountMax && netAmountMax > 0 && {netAmountTo: netAmountMax}),
    ...(hideFilters && {serviceOrderId: [serviceOrderId!]}),
  };

  const {
    data: purchaseInvoiceResource = createEmptyResource<PurchaseInvoiceView>(
      10,
    ),
    isLoading: isPurchaseInvoiceLoading,
    isFetched,
    isIdle,
  } = usePurchaseInvoices(filters, {
    keepPreviousData: true,
    refetchOnWindowFocus: true,
  });

  const {data: purchaseInvoiceStatistics} =
    usePurchaseInvoiceStatistics(filters);
  const aggregatedPurchaseInvoiceStatistics = useMemo(() => {
    if (!purchaseInvoiceStatistics) return undefined;

    return reduce(
      purchaseInvoiceStatistics.numOfInvoicesPerStatus,
      (acc: Record<string, number>, amount, status) => {
        const mappedStatus =
          PurchaseInvoiceStatus[status as keyof typeof PurchaseInvoiceStatus] ??
          status;
        acc[mappedStatus] = (acc[mappedStatus] ?? 0) + amount;
        acc[PurchaseInvoiceStatus.ALL] =
          (acc[PurchaseInvoiceStatus.ALL] ?? 0) + amount;
        return acc;
      },
      {},
    );
  }, [purchaseInvoiceStatistics]);

  const rows = useMemo(
    () => aggregatePurchaseInvoiceRow(purchaseInvoiceResource.data),
    [purchaseInvoiceResource],
  );

  const totalPages = useMemo(
    () =>
      calculateTotalPages(
        purchaseInvoiceResource.total,
        purchaseInvoiceResource.page.pageSize,
      ),
    [purchaseInvoiceResource],
  );

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
  };

  const {handleSubmit, setValue, watch, control} =
    useForm<PurchaseInvoiceFilterForm>({
      defaultValues: {
        number: '',
        subject: '',
        supplierName: '',
        supplierId: '',
        sentDateFrom: '',
        sentDateTo: '',
        netAmountMin,
        netAmountMax,
        purchaseInvoiceStatus: selectedPurchaseInvoiceStatus ?? [],
        hasAttachments: false,
      },
      mode: 'all',
    });

  const watchPurchaseInvoiceStatus = watch('purchaseInvoiceStatus');
  const watchHasAttachments = watch('hasAttachments');
  const watchNetMin = watch('netAmountMin');
  const watchNetMax = watch('netAmountMax');

  const handleDateSelection = (dateValues: DateRange<Date>) => {
    setSelectedDateRange(dateValues);
  };

  const handleSupplierCellClick = (id: string) => () => {
    navigate(`/articles/supplier/${id}`);
  };

  const handleFilterApply: SubmitHandler<PurchaseInvoiceFilterForm> = (
    data,
  ) => {
    setSupplierId(data.supplierId);
    setSupplierName(data.supplierName);
    setSubject(data.subject);
    setPurchaseInvoiceNumber(data.number);
    setSentDateFrom(data.sentDateFrom ? new Date(data.sentDateFrom) : null);
    setSentDateTo(data.sentDateTo ? new Date(data.sentDateTo) : null);
    setNetAmountMin(data.netAmountMin);
    setNetAmountMax(data.netAmountMax);
    setSelectedPurchaseInvoiceStatus(data.purchaseInvoiceStatus);
    setIsWithAttachments(data.hasAttachments ? 'true' : undefined);

    setAppliedFilters({
      purchaseInvoiceNumber: data.number,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      subject: data.subject,
      netAmountMin: data.netAmountMin,
      netAmountMax: data.netAmountMax,
      selectedPurchaseInvoiceStatus: data.purchaseInvoiceStatus.filter(
        (status) => status !== PurchaseInvoiceStatus.ALL,
      ) as (
        | PurchaseInvoiceStatus.NEW
        | PurchaseInvoiceStatus.APPROVED
        | PurchaseInvoiceStatus.REJECTED
        | PurchaseInvoiceStatus.OVERDUE
        | PurchaseInvoiceStatus.PAID
        | PurchaseInvoiceStatus.ARCHIVED
      )[],
      sentDateFrom: data.sentDateFrom ? new Date(data.sentDateFrom) : null,
      sentDateTo: data.sentDateTo ? new Date(data.sentDateTo) : null,
      isWithAttachments: data.hasAttachments ? 'true' : undefined,
    });
  };

  const appliedFilterNumber = useMemo(() => {
    const dateFilterCount =
      appliedFilters.sentDateFrom || appliedFilters.sentDateTo ? 1 : 0;

    return (
      [
        appliedFilters.purchaseInvoiceNumber,
        appliedFilters.supplierId,
        appliedFilters.supplierName,
        appliedFilters.subject,
        appliedFilters.isWithAttachments,
      ].filter((field) => !!field).length +
      [appliedFilters.netAmountMin, appliedFilters.netAmountMax].filter(
        (field) => !!field && field > 0,
      ).length +
      [appliedFilters.selectedPurchaseInvoiceStatus].filter(
        (field) => field.length > 0,
      ).length +
      dateFilterCount
    );
  }, [appliedFilters]);

  const {emptyTable, noMatchingData} = useMemo(() => {
    if (!isFetched) return {emptyTable: false, noMatchingData: false};

    if (
      (appliedFilterNumber > 0 ||
        selectedPurchaseInvoiceStatus.length > 0 ||
        !!searchQuery) &&
      purchaseInvoiceResource.total === 0
    ) {
      return {emptyTable: false, noMatchingData: true};
    }

    // when the user does not have filters applied and there are no entries for the table
    if (purchaseInvoiceResource.total === 0) {
      return {emptyTable: true, noMatchingData: false};
    }

    return {emptyTable: false, noMatchingData: false};
  }, [isFetched, purchaseInvoiceResource]);

  const COLUMNS = useMemo<TableColumnWithRender<PurchaseInvoiceTableRow>[]>(
    () => [
      {
        headerName: 'Number',
        key: 'purchase-invoice-cell-number',
        fieldName: PurchaseInvoiceOrderField.EXTERNAL_ID,
        width: '204px',
        isFirst: true, // remove when checkbox are present with bulk action
        showShadows: showRightShadow ? 'right' : undefined,
        renderCell: (purchaseInvoice, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{purchaseInvoice.externalId}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Subject',
        key: 'purchase-invoice-cell-subject',
        width: '204px',
        fieldName: PurchaseInvoiceOrderField.SUBJECT,
        renderCell: (purchaseInvoice, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{purchaseInvoice.subject}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Supplier',
        key: 'purchase-invoice-cell-supplier',
        width: '214px',
        fieldName: PurchaseInvoiceOrderField.SUPPLIER_NAME,
        renderCell: (purchaseInvoice, cellProps) => (
          <Cell
            {...cellProps}
            onClick={handleSupplierCellClick(purchaseInvoice.supplierId)}>
            <TableCellText sx={getCommonLinkStyles()}>
              {purchaseInvoice.supplierName || '-'}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'SUPPLIER ID',
        key: 'purchase-invoice-cell-supplier-id',
        width: '133px',
        fieldName: PurchaseInvoiceOrderField.SUPPLIER_EXTERNAL_ID,
        renderCell: (purchaseInvoice, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{purchaseInvoice.supplierExternalId}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Job Number',
        key: 'purchase-invoice-cell-job-number',
        width: '133px',
        renderCell: (purchaseInvoice, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {purchaseInvoice.serviceOrders.length > 1 ? (
                <Tooltip
                  title={
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      gap={theme.spacing(0.5)}>
                      {purchaseInvoice.serviceOrders.map((order, index) => (
                        <Typography
                          key={index}
                          sx={{
                            lineHeight: '14px',
                            fontSize: '10px',
                          }}>
                          {order.serviceOrder.externalId}
                        </Typography>
                      ))}
                    </Box>
                  }
                  placement="top"
                  arrow>
                  <span>
                    {purchaseInvoice.serviceOrders
                      .map((order) => order.serviceOrder.externalId)
                      .join(', ')}
                  </span>
                </Tooltip>
              ) : (
                <span>
                  {purchaseInvoice.serviceOrders[0]?.serviceOrder.externalId ||
                    '-'}
                </span>
              )}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Date',
        key: 'purchase-invoice-cell-date',
        width: '114px',
        fieldName: PurchaseInvoiceOrderField.CREATED_AT,
        renderCell: (purchaseInvoice, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {formatDate(purchaseInvoice.sentDate)}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Status',
        key: 'purchase-invoice-cell-status',
        width: '132px',
        fieldName: PurchaseInvoiceOrderField.STATUS,
        align: 'center',
        renderCell: (purchaseInvoice, cellProps) => (
          <Cell {...cellProps}>
            <StatusChip
              color={getPurchaseInvoiceStatusColor(purchaseInvoice.status)}
              label={purchaseInvoiceStatusToString(purchaseInvoice.status)}
              variant="filled"
            />
          </Cell>
        ),
      },
      {
        headerName: 'Amount (excl. VAT)',
        key: 'purchase-invoice-cell-amount',
        width: '202px',
        align: 'right',
        fieldName: PurchaseInvoiceOrderField.TOTAL_AMOUNT_NET,
        renderCell: (purchaseInvoice, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              <TableCellText>{purchaseInvoice.amount}</TableCellText>
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'ATTACHMENT',
        key: 'purchase-invoice-cell-attachments',
        width: '128px',
        align: 'center',
        renderCell: (purchaseInvoice, cellProps) => (
          <Cell
            {...cellProps}
            fieldName="ATTACHMENTS"
            noWidthLimit
            onClick={() =>
              navigate(`/purchase-invoices/details/${purchaseInvoice.id}`)
            }>
            <TableCellText>
              {purchaseInvoice.hasAttachments ? (
                <NoteAlt fontSize="small" />
              ) : (
                <NoteAltOutlined fontSize="small" sx={{color: '#828DA3'}} />
              )}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'action',
        key: 'purchase-invoice-cell-actions',
        isHeaderNameHidden: true,
        align: 'center',
        width: ACTION_CELL_WIDTH, // set static width that will not change
        isLast: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        renderCell: (purchaseInvoice, cellProps) => (
          <Cell {...cellProps} onClick={undefined}>
            <Actions id={purchaseInvoice.id} />
          </Cell>
        ),
      },
    ],
    [showLeftShadow, showRightShadow],
  );

  const handleInvoiceNumberChange = useCallback(
    (value?: string) => {
      setValue('number', value);
    },
    [setValue],
  );

  const handleSubjectChange = useCallback(
    (value?: string) => {
      setValue('subject', value);
    },
    [setValue],
  );

  const handleSupplierNameChange = useCallback(
    (value?: string) => {
      setValue('supplierName', value);
    },
    [setValue],
  );

  const handleSupplierIdChange = useCallback(
    (value?: string) => {
      setValue('supplierId', value);
    },
    [setValue],
  );

  const handleNetAmountMinChange = useCallback(
    (value?: string) => {
      const numberValue = Number(value);
      if (!Number.isNaN(numberValue)) setValue('netAmountMin', numberValue);
    },
    [setValue],
  );

  const handleNetAmountMaxChange = useCallback(
    (value?: string) => {
      const numberValue = Number(value);
      if (!Number.isNaN(numberValue)) setValue('netAmountMax', numberValue);
    },
    [setValue],
  );

  const handleWithAttachmentToggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue('hasAttachments', event.target.checked);
    },
    [setValue, watchHasAttachments],
  );

  const handleSelectedPurchaseInvoiceStatusChange = useCallback(
    (value: string) => {
      if (!watchPurchaseInvoiceStatus.some((type) => type === value)) {
        setValue('purchaseInvoiceStatus', [
          ...watchPurchaseInvoiceStatus,
          value as PurchaseInvoiceStatus,
        ]);
      } else {
        setValue(
          'purchaseInvoiceStatus',
          watchPurchaseInvoiceStatus.filter((type) => type !== value),
        );
      }
    },
    [watchPurchaseInvoiceStatus],
  );

  const handleFilterOpen = () => {
    setValue('supplierId', supplierId);
    setValue('supplierName', supplierName);
    setValue('subject', subject);
    setValue('number', purchaseInvoiceNumber);

    // Check the type and convert accordingly
    setValue(
      'sentDateFrom',
      sentDateFrom instanceof Date ? sentDateFrom.toISOString() : null,
    );
    setValue(
      'sentDateTo',
      sentDateTo instanceof Date ? sentDateTo.toISOString() : null,
    );

    setValue('netAmountMin', netAmountMin);
    setValue('netAmountMax', netAmountMax);
    setValue('hasAttachments', isWithAttachments === 'true');
  };

  const handleFilterReset = () => {
    setValue('supplierId', '');
    setValue('supplierName', '');
    setValue('subject', '');
    setValue('number', '');
    setValue('subject', '');
    setResetDatePicker(true);
    setValue('sentDateFrom', null);
    setValue('sentDateTo', null);
    setValue('netAmountMin', undefined);
    setValue('netAmountMax', undefined);
    setValue('hasAttachments', undefined);
    setValue('purchaseInvoiceStatus', []);
  };

  useEffect(() => {
    if (!selectedDateRange[0] || !selectedDateRange[1]) {
      const today = new Date();
      const oneYearAgo = subYears(today, 1);
      setSelectedDateRange([oneYearAgo, today]);
    }
  }, []);

  useEffect(() => {
    if (!isFetched) return;
    if (purchaseInvoiceResource.total === 0 && initialLoadNoEntries !== false) {
      setInitialLoadNoEntries(true);
    } else if (purchaseInvoiceResource.total > 0) {
      setInitialLoadNoEntries(false);
    }
  }, [
    initialLoadNoEntries,
    isFetched,
    purchaseInvoiceResource,
    setInitialLoadNoEntries,
  ]);

  const handleQuickFilterChange = (value: string) => {
    if (value === 'ALL') {
      setSelectedPurchaseInvoiceStatus([PurchaseInvoiceStatus.ALL]);
      return;
    }

    const newValues = selectedPurchaseInvoiceStatus.some(
      (option) => option === value,
    )
      ? selectedPurchaseInvoiceStatus.filter((option) => option !== value)
      : [...selectedPurchaseInvoiceStatus, value];

    if (newValues.length > 1 && newValues.includes('ALL')) {
      setSelectedPurchaseInvoiceStatus(
        newValues.filter(
          (selectedValues) => selectedValues !== 'ALL',
        ) as PurchaseInvoiceStatus[],
      );
      return;
    }

    const areAllValuesSelectedIndividually =
      QUICK_FILTER_OPTIONS_WITHOUT_ALL.every((option) =>
        newValues.some((selectedValue) => option.value === selectedValue),
      );

    setSelectedPurchaseInvoiceStatus(
      areAllValuesSelectedIndividually
        ? [PurchaseInvoiceStatus.ALL]
        : (newValues as PurchaseInvoiceStatus[]),
    );
  };

  const navigateToNewInvoice = () => {
    navigate('/purchase-invoices/new');
  };

  if (isIdle || isPurchaseInvoiceLoading) {
    return <Progress />;
  }

  if (emptyTable) {
    return (
      <EmptyTable
        illustration="purchase-invoice"
        label="No Purchase Invoices"
        subLabel="Create a new purchase invoice to start working and tracking its progress"
        btnLabel="New Purchase Invoice"
        actionButton={
          <Button
            buttonProps={{
              onClick: navigateToNewInvoice,
              sx: {
                textTransform: 'capitalize',
                ml: '0.8em',
                fontSize: '14px',
              },
              variant: 'contained',
              color: 'primary',
              size: 'small',
              startIcon: <AddIcon />,
            }}>
            <Typography variant="body1" sx={{textTransform: 'capitalize'}}>
              {t('New Invoice')}
            </Typography>
          </Button>
        }
      />
    );
  }

  return (
    <PageContainer gap={3}>
      <Box
        gap={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          p: 3,
        }}>
        <PageHeaderContainer>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
            gap={2}>
            <SearchInput
              refInput={textInput}
              defaultValue={searchQuery}
              onChange={(val: string) => setSearchQuery(val)}
              containerStyle={{paddingTop: '8px'}}
            />

            <DatePickerRange
              defaultDate={selectedDateRange}
              getSelectedDate={handleDateSelection}
              textFieldProps={{
                label: t('Date Filter'),
              }}
              onClear={() => setSelectedDateRange([null, null])}
              sx={{width: '300px', paddingTop: 0}}
              inputTestId="start-end-date"
              popupTestId="start-end-date-popup"
            />

            {!hideFilters && (
              <Filters
                activeFilters={appliedFilterNumber}
                onOpen={handleFilterOpen}
                onSave={handleSubmit(handleFilterApply)}
                onReset={handleFilterReset}>
                <Box
                  sx={{display: 'flex', flexDirection: 'column', width: '100%'}}
                  gap={2}>
                  <Controller
                    control={control}
                    name="number"
                    render={({field}) => (
                      <TextInput
                        {...field}
                        labelKey="Number"
                        placeholder="Enter invoice number"
                        onChange={handleInvoiceNumberChange}
                        size="small"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="subject"
                    render={({field}) => (
                      <TextInput
                        {...field}
                        labelKey="Subject"
                        placeholder="Enter subject"
                        onChange={handleSubjectChange}
                        size="small"
                      />
                    )}
                  />

                  <Box sx={{display: 'flex'}} gap={1}>
                    <Controller
                      control={control}
                      name="supplierName"
                      render={({field}) => (
                        <TextInput
                          {...field}
                          labelKey="Supplier Name"
                          placeholder="Enter supplier name"
                          onChange={handleSupplierNameChange}
                          size="small"
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="supplierId"
                      render={({field}) => (
                        <TextInput
                          {...field}
                          labelKey="Supplier ID"
                          placeholder="Enter supplier ID"
                          onChange={handleSupplierIdChange}
                          size="small"
                        />
                      )}
                    />
                  </Box>

                  <Box sx={{display: 'flex'}} gap={1}>
                    <Box>
                      <Typography variant="subtitle2">
                        {t('Start Date')}
                      </Typography>
                      <Controller
                        control={control}
                        name="sentDateFrom"
                        render={({field}) => {
                          const dateValue = field.value
                            ? new Date(field.value)
                            : undefined;

                          return (
                            <DatePicker
                              {...field}
                              defaultDate={dateValue}
                              maxDate={new Date()}
                              minDate={dateValue || undefined}
                              reset={resetDatePicker}
                              getReset={(val) => {
                                if (val) {
                                  setResetDatePicker(false);
                                }
                              }}
                              containerStyles={{mr: '1em'}}
                              getSelectedDate={(date) => {
                                field.onChange(date);
                                setSentDateFrom(date);
                              }}
                              inputLabelProps={{shrink: undefined}}
                              textFieldProps={{
                                label: '',
                                sx: {background: '#fff'},
                              }}
                              value={dateValue}
                            />
                          );
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2">
                        {t('End Date')}
                      </Typography>

                      <Controller
                        control={control}
                        name="sentDateTo"
                        render={({field}) => {
                          const dateValue = field.value
                            ? new Date(field.value)
                            : null;

                          return (
                            <DatePicker
                              {...field}
                              defaultDate={dateValue}
                              maxDate={new Date()}
                              minDate={
                                sentDateFrom
                                  ? new Date(sentDateFrom)
                                  : undefined
                              }
                              reset={resetDatePicker}
                              getReset={(val) => {
                                if (val) {
                                  setResetDatePicker(false);
                                }
                              }}
                              containerStyles={{mr: '1em'}}
                              getSelectedDate={(date) => {
                                field.onChange(date);
                                setSentDateTo(date);
                              }}
                              inputLabelProps={{shrink: undefined}}
                              textFieldProps={{
                                label: '',
                                sx: {background: '#fff'},
                              }}
                              value={dateValue}
                            />
                          );
                        }}
                      />
                    </Box>
                  </Box>

                  <ChipSelector
                    headerLabel="Invoice Status"
                    options={QUICK_FILTER_OPTIONS}
                    selectedChips={watchPurchaseInvoiceStatus}
                    onChange={handleSelectedPurchaseInvoiceStatusChange}
                  />

                  <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
                    <Typography variant="subtitle2">
                      {t('Amount Range')}
                    </Typography>

                    <Box sx={{display: 'flex'}} gap={1}>
                      <Controller
                        control={control}
                        name="netAmountMin"
                        render={() => (
                          <TextInput
                            value={watchNetMin ? `${watchNetMin}` : ''}
                            placeholder="Min"
                            styles={{
                              '& .MuiInputBase-input': {
                                textAlign: 'end',
                              },
                            }}
                            size="small"
                            onChange={handleNetAmountMinChange}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="netAmountMax"
                        render={() => (
                          <TextInput
                            value={watchNetMax ? `${watchNetMax}` : ''}
                            placeholder="Max"
                            styles={{
                              '& .MuiInputBase-input': {
                                textAlign: 'end',
                              },
                            }}
                            size="small"
                            onChange={handleNetAmountMaxChange}
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
                      {t('Attachments')}
                    </Typography>
                    <Controller
                      control={control}
                      name="hasAttachments"
                      render={() => (
                        <Checkbox
                          checked={watchHasAttachments}
                          onChange={handleWithAttachmentToggle}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Filters>
            )}
          </Box>
          <Button
            buttonProps={{
              onClick: navigateToNewInvoice,
              sx: {
                textTransform: 'capitalize',
                ml: '0.8em',
                fontSize: '14px',
              },
              variant: 'contained',
              color: 'primary',
              size: 'small',
              startIcon: <AddIcon />,
            }}>
            <Typography variant="body1" sx={{textTransform: 'capitalize'}}>
              {t('New Invoice')}
            </Typography>
          </Button>
        </PageHeaderContainer>

        <Box>
          <QuickFilter
            selected={selectedPurchaseInvoiceStatus ?? null}
            options={QUICK_FILTER_OPTIONS}
            statistics={aggregatedPurchaseInvoiceStatistics}
            onChange={handleQuickFilterChange}
          />
        </Box>

        <DashboardMetrics
          selectedDateRange={selectedDateRange}
          filters={filters}
        />

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
            {rows.map((entry) => (
              <TableRow
                key={`purchase-invoice-row-${entry.id}`}
                testId={`purchase-invoice-row-${entry.id}`}>
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
          currentIndex={purchaseInvoiceResource.page.pageIndex}
          numberOfElementsPerPage={purchaseInvoiceResource.page.pageSize}
          totalEntries={purchaseInvoiceResource.total}
          totalPages={totalPages}
          onChange={handlePageIndexChange}
          onNumberPerPageChange={handleChangeElementsPerPage}
        />
      </Box>
    </PageContainer>
  );
};

export default PurchaseInvoices;
