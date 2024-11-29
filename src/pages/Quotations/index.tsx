import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  useAllQuotations,
  useQuotationComments,
  useQuotations,
  useQuotationStatistics,
} from 'hooks/reactQuery/useQuotation';
import {
  QueryQuotationParams,
  QUOTATION_STATUS_FILTER,
  QuotationFilterForm,
  QuotationOrderField,
  QuotationStatus,
  QuotationTableRow,
  QuotationView,
  STATUS_COLOR,
} from 'models/quotation';
import {createEmptyResource, makePage, toggleOrder} from 'utils/paging';
import {Progress} from 'components/Progress';
import {useQueryState} from 'hooks/useQueryState';
import {useTranslation} from 'react-i18next';
import DatePickerRange from 'components/DatePickerRange';
import {DateRange} from '@mui/x-date-pickers-pro';
import {useSearchValues} from 'hooks/useSearchValues';
import {Order, OrderByParams} from 'models/pagination';
import {
  ACTION_CELL_WIDTH,
  NOTES_CELL_WIDTH,
  TableColumnWithRender,
} from 'models/table';
import Cell from 'components/Table/TableCell';
import TableCellText from 'components/Table/TableCellText';
import {theme} from 'theme';
import {Avatar} from 'components/Avatar';
import {
  DEFAULT_DATE_FORMAT,
  formatDate,
  fromDateStringToDate,
} from 'utils/datetime';
import {StatusChip} from 'components/StatusChip';
import {
  aggregateQuotationRow,
  createSearchQuery,
  getStatusString,
  mapFilterOptionToStatus,
  mapStatusToFilterOptions,
} from 'utils/quotation';
import Actions from 'pages/Quotations/Actions';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import PageContainer from 'components/PageContainer';
import PageHeaderContainer from 'components/PageHeaderContainer';
import Box from '@mui/material/Box';
import SearchInput from 'components/SearchInput/index';
import Filters from 'components/Filters';
import TextInput from 'components/TextInput';
import CustomerInput from 'components/Inputs/CustomerInput';
import CustomerIdInput from 'components/Inputs/CustomerInput/CustomerIdInput';
import UnitIdInput from 'components/Inputs/UnitInput/UnitIdInput';
import ServiceOrderIdInput from 'components/Inputs/ServiceOrderInput/ServiceOrderIdInput';
import {Checkbox, CircularProgress, Typography} from '@mui/material';
import {Button} from 'components/Button';
import AddButton from 'components/AddButton';
import QuickFilter from 'components/QuickFilter';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import TableBody from 'components/Table/TableBody';
import TableRow from 'components/Table/TableRow';
import Pagination from 'components/Pagination';
import EmptyTable from 'components/Table/EmptyTable';
import {OptionWithTranslationKey} from 'models/filter';
import {capitalize, reduce} from 'lodash';
import {createExcelContent} from 'utils/utils';
import {downloadExcel} from 'utils/download';
import {useSnackbar} from 'hooks/useSnackbar';
import {getPlainStringFromHtml} from 'utils/rich-field-string';
import NotesDrawer from 'pages/QuotationDetails/NotesDrawer';
import {
  createQuickFilterOptions,
  filterOutQuickFilterOptions,
} from 'utils/filter';
import {InvoiceOrderField} from 'models/invoice';
import {convertNumberToAmountNumber, useCurrentCurrency} from 'utils/currency';
import NoteIcon from 'components/NoteIcon';

const pageSize = 25;

const QUICK_FILTER_OPTIONS: OptionWithTranslationKey[] =
  createQuickFilterOptions(QUOTATION_STATUS_FILTER);

export const Quotations = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {enqueueSnackbar} = useSnackbar();
  const currentCurrency = useCurrentCurrency();

  const [search, setSearch] = useQueryState('searchQuotations');

  const [selectedStatus, setSelectedStatus] = useQueryState<
    QUOTATION_STATUS_FILTER[]
  >('selectedStatus', {
    defaultValue: [],
  });

  const [selectedQuotationNumber, setSelectedQuotationNumber] = useQueryState<
    string | undefined
  >('selectedQuotationNumber', {defaultValue: undefined});

  const [selectedJobNumber, setSelectedJobNumber] = useQueryState<
    string | undefined
  >('selectedJobNumber', {defaultValue: undefined});

  const [selectedUnitId, setSelectedUnitId] = useQueryState<string | undefined>(
    'selectedUnitId',
    {defaultValue: undefined},
  );

  const [selectedCustomer, setSelectedCustomer] = useQueryState<
    string | undefined
  >('selectedCustomer', {defaultValue: undefined});

  const [selectedCustomerId, setSelectedCustomerId] = useQueryState<
    string | undefined
  >('selectedCustomerId', {defaultValue: undefined});

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

  const [hasComment, setHasComment] = useQueryState<string | undefined>(
    'hasComment',
    {
      defaultValue: undefined,
    },
  );

  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const textInput = useRef<HTMLInputElement>(null);

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<
    QuotationView | undefined
  >();
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

  const {
    values: {sortOrder, orderByField},
    updateValues,
  } = useSearchValues<OrderByParams<QuotationOrderField>>();

  const query = useMemo(
    () =>
      createSearchQuery({
        search,
        quotationNumber: selectedQuotationNumber,
      }),
    [search, selectedQuotationNumber],
  );

  const filters: QueryQuotationParams = {
    ...(query && {query}),
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    order: sortOrder || Order.DESC,
    orderByField: orderByField || QuotationOrderField.CREATED_DATE,
    status: selectedStatus.includes(QUOTATION_STATUS_FILTER.ALL)
      ? []
      : selectedStatus.map(mapFilterOptionToStatus),
    ...(selectedCustomer && {propertyOwnerId: [selectedCustomer]}),
    ...(selectedUnitId && {elevatorId: [selectedUnitId]}),
    ...(selectedJobNumber && {serviceOrderId: [selectedJobNumber]}),

    ...(selectedStartDate && {
      createdDateStart: fromDateStringToDate(
        selectedStartDate,
        DEFAULT_DATE_FORMAT,
      ),
    }),
    ...(selectedEndDate && {
      createdDateEnd: fromDateStringToDate(
        selectedEndDate,
        DEFAULT_DATE_FORMAT,
      ),
    }),

    ...(netAmountMin &&
      netAmountMin > 0 && {
        totalNetAmountFrom: `${convertNumberToAmountNumber(
          netAmountMin,
          currentCurrency,
        )}`,
      }),
    ...(netAmountMax &&
      netAmountMax > 0 && {
        totalNetAmountTo: `${convertNumberToAmountNumber(
          netAmountMax,
          currentCurrency,
        )}`,
      }),

    ...(hasComment === 'true' && {
      hasComments: true,
    }),
  };

  const {
    data: quotationsResource = createEmptyResource<QuotationView>(pageSize),
    isLoading,
    isFetched,
    isIdle,
    refetch: refetchQuotations,
  } = useQuotations(filters, {keepPreviousData: true});

  const {data: quotationStatistics} = useQuotationStatistics(filters, {
    keepPreviousData: true,
  });

  const {data: notes} = useQuotationComments(
    hoverNoteServiceId ?? '',
    {
      pageIndex: 0,
      pageSize: 1,
    },
    {
      enabled: !!hoverNoteServiceId,
    },
  );

  const {refetch: refetchAllQuotations, isFetching: isFetchingAllQuotations} =
    useAllQuotations(filters, {
      enabled: false,
      refetchOnWindowFocus: false,
    });

  const fetchedNote = useMemo(() => notes?.data[0], [notes]);

  const navigateToNewQuotation = () => {
    navigate('new');
  };

  const handleCustomerCellClick = (id: string) => () => {
    navigate(`/customers/details/${id}?tab=0`);
  };

  const handleNoteHover = (serviceOrderId: string | undefined) => () => {
    setHoverNoteServiceId(serviceOrderId);
  };

  const COLUMNS = useMemo<TableColumnWithRender<QuotationTableRow>[]>(
    () => [
      {
        headerName: 'Number',
        key: 'quotation-cell-number',
        fieldName: QuotationOrderField.EXTERNAL_ID,
        width: '124px',
        isFirst: true, // remove when checkbox are present with bulk action
        showShadows: showRightShadow ? 'right' : undefined,
        getExportValue: (quotation) => quotation.number,
        renderCell: (quotation, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{quotation.number}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Customer',
        key: 'quotation-cell-customer',
        width: '212px',
        fieldName: QuotationOrderField.CUSTOMER_NAME,
        getExportValue: (quotation) => quotation.propertyOwner?.name || '',
        renderCell: (quotation, cellProps) => (
          <Cell
            {...cellProps}
            onClick={handleCustomerCellClick(quotation.propertyOwner.id)}>
            <Avatar
              labelStyles={{
                color: theme.palette.primary.light,
              }}
              key={`company-avatar-${quotation.propertyOwner.id}`}
              userAccount={{firstName: quotation.propertyOwner?.name || '-'}}
            />
          </Cell>
        ),
      },
      {
        headerName: 'Subject',
        key: 'quotation-cell-subject',
        getExportValue: (quotation) =>
          getPlainStringFromHtml(quotation.subject),
        renderCell: (quotation, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {getPlainStringFromHtml(quotation.subject)}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'CREATED DATE',
        key: 'quotation-cell-next-inspection',
        width: '132px',
        fieldName: QuotationOrderField.CREATED_DATE,
        getExportValue: (quotation) =>
          (quotation.createdDate
            ? formatDate(quotation.createdDate)
            : undefined) ?? '',
        renderCell: (quotation, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {(quotation.createdDate
                ? formatDate(quotation.createdDate)
                : undefined) ?? ''}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Amount (excl. VAT)',
        key: 'quotation-cell-total',
        width: '186px',
        align: 'right',
        fieldName: InvoiceOrderField.TOTAL_NET_AMOUNT,
        getExportValue: (quotation) => quotation.amount,
        renderCell: (quotation, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{quotation.amount}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Status',
        key: 'quotation-cell-status',
        width: '142px',
        align: 'center',
        getExportValue: (quotation) => t(getStatusString(quotation.status)),
        renderCell: (quotation, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText component="div">
              <StatusChip
                label={getStatusString(quotation.status)}
                bgColor={STATUS_COLOR[quotation.status]}
                variant="filled"
                size="small"
                maxChars={9}
              />
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'NOTES',
        key: 'quotation-cell-notes',
        width: NOTES_CELL_WIDTH,
        align: 'center',
        fieldName: QuotationOrderField.COMMENT_COUNT,
        renderCell: (quotation, cellProps) => (
          <Cell
            {...cellProps}
            fieldName="NOTES"
            noWidthLimit
            onClick={() => setSelectedQuotation(quotation.data)}>
            <NoteIcon
              hasNotes={quotation.hasComments}
              timeStamp={formatDate(fetchedNote?.meta.lastUpdatedAt)}
              noteContent={fetchedNote?.content}
              onMouseEnter={handleNoteHover(quotation.id)}
              onMouseLeave={handleNoteHover(undefined)}
            />
          </Cell>
        ),
      },
      {
        headerName: 'action',
        key: 'quotation-cell-action',
        isHeaderNameHidden: true,
        align: 'center',
        width: ACTION_CELL_WIDTH, // set static width that will not change
        isLast: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        noPadding: true,
        renderCell: (quotation, cellProps) => (
          <Cell {...cellProps} onClick={undefined}>
            <Actions quotation={quotation.data} />
          </Cell>
        ),
      },
    ],
    [showLeftShadow, showRightShadow, fetchedNote],
  );

  // filter intermediate state
  const {handleSubmit, setValue, watch, control} = useForm<QuotationFilterForm>(
    {
      defaultValues: {
        number: selectedQuotationNumber,
        customer: selectedCustomer,
        customerId: selectedCustomerId,
        unitId: selectedUnitId,
        jobNumber: selectedJobNumber,
        netAmountMax,
        netAmountMin,
        hasComment: hasComment === 'true',
      },
      mode: 'all',
    },
  );

  const watchCustomer = watch('customer');
  const watchUnitId = watch('unitId');
  const watchJobId = watch('jobNumber');
  const watchHasComment = watch('hasComment');
  const watchGrossMin = watch('netAmountMin');
  const watchGrossMax = watch('netAmountMax');

  const rows = useMemo(
    () => aggregateQuotationRow(quotationsResource.data),
    [quotationsResource],
  );

  const handleFilterApply: SubmitHandler<QuotationFilterForm> = (data) => {
    setSelectedQuotationNumber(data.number);
    setSelectedCustomer(data.customer);
    setSelectedCustomerId(data.customerId);
    setSelectedUnitId(data.unitId);
    setSelectedJobNumber(data.jobNumber);
    setNetAmountMin(data.netAmountMin);
    setNetAmountMax(data.netAmountMax);
    setHasComment(data.hasComment ? 'true' : undefined);
  };

  const handleFilterOpen = () => {
    setValue('number', selectedQuotationNumber);
    setValue('customer', selectedCustomer);
    setValue('customerId', selectedCustomer);
    setValue('unitId', selectedUnitId);
    setValue('jobNumber', selectedJobNumber);
    setValue('netAmountMin', netAmountMin);
    setValue('netAmountMax', netAmountMax);
    setValue('hasComment', hasComment === 'true');
  };

  const handleFilterReset = () => {
    setValue('number', '');
    setValue('customer', undefined);
    setValue('customerId', undefined);
    setValue('unitId', undefined);
    setValue('jobNumber', undefined);
    setValue('netAmountMin', undefined);
    setValue('netAmountMax', undefined);
    setValue('hasComment', undefined);
  };

  const appliedFilterNumber = useMemo(
    () =>
      [
        selectedQuotationNumber,
        selectedCustomer || selectedCustomerId,
        selectedUnitId,
        selectedJobNumber,
        hasComment,
      ].filter((field) => !!field).length +
      [netAmountMin, netAmountMax].filter((field) => !!field && field > 0)
        .length,
    [
      selectedQuotationNumber,
      selectedCustomer,
      selectedCustomerId,
      selectedUnitId,
      selectedJobNumber,
      netAmountMin,
      netAmountMax,
      hasComment,
    ],
  );

  const {emptyTable, noMatchingData} = useMemo(() => {
    if (!isFetched) return {emptyTable: false, noMatchingData: false};

    if (
      (appliedFilterNumber > 0 ||
        selectedStatus.length > 0 ||
        selectedStartDate ||
        selectedEndDate ||
        !!search) &&
      quotationsResource.total === 0
    ) {
      return {emptyTable: false, noMatchingData: true};
    }

    // when the user does not have filters applied and there are no entries for the table
    if (quotationsResource.total === 0) {
      return {emptyTable: true, noMatchingData: false};
    }

    return {emptyTable: false, noMatchingData: false};
  }, [appliedFilterNumber, isFetched, quotationsResource]);

  const aggregatedQuotationStatistics = useMemo(() => {
    if (!quotationStatistics) return undefined;

    return reduce(
      quotationStatistics.numOfQuotationsPerStatus,
      (acc: Record<string, number>, amount, currentStatus) => {
        const statusToUpdate = mapStatusToFilterOptions(
          currentStatus as QuotationStatus,
        );
        acc[statusToUpdate] = (acc[statusToUpdate] ?? 0) + amount;
        acc[QUOTATION_STATUS_FILTER.ALL] =
          (acc[QUOTATION_STATUS_FILTER.ALL] ?? 0) + amount;
        return acc;
      },
      {},
    );
  }, [quotationStatistics]);

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleRowClick = (id: string) => () => {
    navigate(`/quotations/details/${id}`);
  };

  const handleSortField = (fieldName: string) => {
    const order = toggleOrder(
      orderByField === fieldName ? sortOrder : undefined,
    );
    updateValues({
      orderByField: order ? (fieldName as QuotationOrderField) : undefined,
      sortOrder: order,
    });
  };

  const handleQuickFilterChange = (value: string) => {
    // when selecting ALL values remove all other selections
    if (value === 'ALL') {
      setSelectedStatus(
        selectedStatus.length === 1 &&
          selectedStatus[0] === QUOTATION_STATUS_FILTER.ALL
          ? []
          : [QUOTATION_STATUS_FILTER.ALL],
      );
      return;
    }

    const newValues = selectedStatus.some((option) => option === value)
      ? selectedStatus.filter((option) => option !== value)
      : [...selectedStatus, value];

    // remove the ALL status if any other status is selected
    if (newValues.length > 1 && newValues.includes('ALL')) {
      setSelectedStatus(
        newValues.filter(
          (selectedValues) => selectedValues !== 'ALL',
        ) as QUOTATION_STATUS_FILTER[],
      );
      return;
    }

    const areAllValuesSelectedIndividually = filterOutQuickFilterOptions({
      options: QUICK_FILTER_OPTIONS,
    }).every((option) =>
      newValues.some((selectedValue) => option.value === selectedValue),
    );

    setSelectedStatus(
      areAllValuesSelectedIndividually
        ? [QUOTATION_STATUS_FILTER.ALL]
        : (newValues as QUOTATION_STATUS_FILTER[]),
    );
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

  const handleExport = async () => {
    try {
      // Initiate the export process by fetching all filtered service orders
      const {data} = await refetchAllQuotations();

      if (!data || data.length === 0) {
        return;
      }

      const excludedFields = ['quotation-cell-notes', 'quotation-cell-action'];

      const filteredColumns = COLUMNS.filter(
        (col) => !excludedFields.includes(col.key),
      );

      const headers = filteredColumns.map((col) =>
        capitalize(t(col.headerName)),
      );

      const dataRows = aggregateQuotationRow(data).map((quotations) =>
        filteredColumns.map((col) => col.getExportValue?.(quotations) || ''),
      );

      const filename = 'Quotations';

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

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = search;
    }
  }, []);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (emptyTable) {
    return (
      <EmptyTable
        illustration="quotation"
        label="No quotations"
        subLabel="Create a new quotation to offer clients tailored service proposals and pricing, ready to be sent out."
        btnLabel="New Quotation"
        onClick={navigateToNewQuotation}
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
                      labelKey="Quotation number"
                      placeholder="Search quotation number"
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

                <Controller
                  control={control}
                  name="jobNumber"
                  render={({field}) => (
                    <ServiceOrderIdInput
                      selectedValue={watchJobId}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
                  <Typography variant="subtitle2">{t('Net amount')}</Typography>

                  <Box sx={{display: 'flex'}} gap={1}>
                    <Controller
                      control={control}
                      name="netAmountMin"
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
                      name="netAmountMax"
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
                    {t('Quote(s) with notes')}
                  </Typography>
                  <Controller
                    control={control}
                    name="hasComment"
                    render={({field}) => (
                      <Checkbox
                        data-testid="quotation-filter-note-checkbox"
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
                  disabled: isFetchingAllQuotations,
                }}
                style={{
                  borderColor: 'text.primary',
                  height: '36px',
                  paddingTop: 0,
                }}>
                {isFetchingAllQuotations ? (
                  <CircularProgress size="1rem" sx={{mr: 1}} />
                ) : null}
                <Box pt={0.5}>{t('Export')}</Box>
              </Button>
            )}
            <AddButton label="New Quotation" onClick={navigateToNewQuotation} />
          </Box>
        </PageHeaderContainer>
        <Box>
          <QuickFilter
            selected={selectedStatus ?? null}
            options={QUICK_FILTER_OPTIONS}
            statistics={aggregatedQuotationStatistics}
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
                key={`quotation-row-${entry.id}`}
                testId={`quotation-row-${entry.id}`}>
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
          currentIndex={quotationsResource.page.pageIndex}
          numberOfElementsPerPage={quotationsResource.page.pageSize}
          totalEntries={quotationsResource.total}
          onChange={handlePageIndexChange}
          onNumberPerPageChange={handleChangeElementsPerPage}
        />
      </PageContainer>

      {selectedQuotation && (
        <NotesDrawer
          open
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(undefined)}
          onChange={refetchQuotations}
        />
      )}
    </>
  );
};

export default Quotations;
