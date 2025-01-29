import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  useAllContracts,
  useContractStatistics,
  useQueryContract,
} from 'hooks/reactQuery/useContract';
import {
  CONTRACT_STATUS_FILTER,
  ContractFilterForm,
  ContractOrderField,
  ContractStatus,
  ContractTableRow,
  ContractView,
  QueryContractParams,
} from 'models/contract';
import {createEmptyResource, makePage, toggleOrder} from 'utils/paging';
import {useNavigate} from 'react-router-dom';
import {Progress} from 'components/Progress';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {
  aggregateContractRow,
  getContractStatusStyles,
  mapFilterOptionToStatus,
  mapStatusToFilterOptions,
} from 'utils/contract';
import {convertNumberToAmountNumber, useCurrentCurrency} from 'utils/currency';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useSearchValues} from 'hooks/useSearchValues';
import EmptyTable from 'components/Table/EmptyTable';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {ACTION_CELL_WIDTH, TableColumnWithRender} from 'models/table';
import Cell from 'components/Table/TableCell';
import TableCellText from 'components/Table/TableCellText';
import {Avatar} from 'components/Avatar';
import {theme} from 'theme';
import {StatusChip} from 'components/StatusChip';
import {Order, OrderByParams} from 'models/pagination';
import {useTranslation} from 'react-i18next';
import Actions from 'pages/Contracts/NewActions';
import PageContainer from 'components/PageContainer';
import PageHeaderContainer from 'components/PageHeaderContainer';
import Box from '@mui/material/Box';
import SearchInput from 'components/SearchInput/index';
import DatePickerRange from 'components/DatePickerRange';
import Filters from 'components/Filters';
import TextInput from 'components/TextInput';
import CustomerInput from 'components/Inputs/CustomerInput';
import UnitIdInput from 'components/Inputs/UnitInput/UnitIdInput';
import {CircularProgress, Typography} from '@mui/material';
import {Button} from 'components/Button';
import AddButton from 'components/AddButton';
import QuickFilter from 'components/QuickFilter';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import TableBody from 'components/Table/TableBody';
import TableRow from 'components/Table/TableRow';
import Pagination from 'components/Pagination';
import {OptionWithTranslationKey} from 'models/filter';
import {
  createQuickFilterOptions,
  filterOutQuickFilterOptions,
} from 'utils/filter';
import {DateRange} from '@mui/x-date-pickers-pro';
import {DEFAULT_DATE_FORMAT, fromDateStringToDate} from 'utils/datetime';
import {useExportTableSheet} from 'hooks/useExport';
import {reduce} from 'lodash';
import ChipSelector from 'components/ChipSelector';
import {
  filterServiceOrderTypes,
  serviceOrderTypeToString,
} from 'utils/service-order-utils';
import {
  useCompanyJobTypes,
  useOldCompanyJobTypes,
} from 'hooks/reactQuery/useCompanies';
import {ServiceOrderType} from 'models/service-order';
import PropertyInput from 'components/Inputs/PropertyInput';
import {PropertyType} from 'models/valueProperty';
import MonthInput from 'components/Inputs/MonthInput';

const pageSize = 25;

const QUICK_FILTER_OPTIONS: OptionWithTranslationKey[] =
  createQuickFilterOptions(CONTRACT_STATUS_FILTER);

export const Contracts = () => {
  const currentCurrency = useCurrentCurrency();
  const {user} = useUserSession();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const [search, setSearch] = useQueryState('searchContracts');
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const [selectedCustomer, setSelectedCustomer] = useQueryState<
    string | undefined
  >('selectedCustomer', {defaultValue: undefined});

  const [selectedUnitId, setSelectedUnitId] = useQueryState<string | undefined>(
    'selectedUnitId',
    {defaultValue: undefined},
  );

  const [selectedSerialNumber, setSelectedSerialNumber] = useQueryState<
    string | undefined
  >('selectedSerialNumber', {defaultValue: undefined});

  const [selectedStatus, setSelectedStatus] = useQueryState<
    CONTRACT_STATUS_FILTER[]
  >('selectedStatus', {
    defaultValue: [],
  });

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

  const [selectedJobTypes, setSelectedJobTypes] = useQueryState<
    ServiceOrderType[]
  >('selectedJobTypes', {defaultValue: []});

  const [selectedTriggerMonths, setSelectedTriggerMonths] = useQueryState<
    number[]
  >('selectedTriggerMonths', {defaultValue: []});

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

  const [numberOfUnitsMin, setNumberOfUnitsMin] = useQueryState<
    number | undefined
  >('numberOfUnitsMin', {
    defaultValue: undefined,
  });
  const [numberOfUnitsMax, setNumberOfUnitsMax] = useQueryState<
    number | undefined
  >('numberOfUnitsMax', {
    defaultValue: undefined,
  });

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textInput = useRef<HTMLInputElement>(null);

  const [tempDateRange, setTempDateRange] = useState<DateRange<Date>>([
    selectedStartDate
      ? fromDateStringToDate(selectedStartDate, DEFAULT_DATE_FORMAT)
      : null,
    selectedEndDate
      ? fromDateStringToDate(selectedEndDate, DEFAULT_DATE_FORMAT)
      : null,
  ]);

  const {
    values: {sortOrder, orderByField},
    updateValues,
  } = useSearchValues<OrderByParams<ContractOrderField>>();

  const filters: QueryContractParams = {
    pageIndex: page.pageIndex || 0,
    pageSize: page.pageSize || 25,
    query: search,
    order: sortOrder || Order.DESC,
    orderBy: orderByField || ContractOrderField.CREATED_TIME,

    ...(selectedStatus.length && {
      status: selectedStatus.flatMap(mapFilterOptionToStatus),
    }),

    ...(selectedCustomer && {
      propertyOwnerId: selectedCustomer,
    }),

    ...(selectedUnitId && {
      elevatorId: [selectedUnitId],
    }),

    ...(selectedSerialNumber && {
      elevatorSerialNumber: [selectedSerialNumber],
    }),

    ...(selectedJobTypes.length && {
      serviceOrderType: selectedJobTypes,
    }),

    ...(netAmountMin &&
      netAmountMin > 0 && {
        totalYearNetAmountStart: convertNumberToAmountNumber(
          netAmountMin,
          currentCurrency,
        ),
      }),

    ...(netAmountMax &&
      netAmountMax > 0 && {
        totalYearNetAmountEnd: convertNumberToAmountNumber(
          netAmountMax,
          currentCurrency,
        ),
      }),

    ...(numberOfUnitsMin && {
      numberOfElevatorsFrom: numberOfUnitsMin,
    }),

    ...(numberOfUnitsMax && {
      numberOfElevatorsTo: numberOfUnitsMax,
    }),

    ...(selectedTriggerMonths.length && {
      orderGenerationMonth: selectedTriggerMonths,
    }),
  };

  const defaultFilters: QueryContractParams = {
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    order: sortOrder || Order.DESC,
    orderBy: orderByField || ContractOrderField.CREATED_TIME,
  };

  const {
    data: contractResource = createEmptyResource<ContractView>(10),
    isLoading,
    isFetched,
    isIdle,
  } = useQueryContract(filters, {keepPreviousData: true});

  const {refetch: refetchAllContracts, isFetching: isFetchingAllContracts} =
    useAllContracts(filters, {
      enabled: false,
      refetchOnWindowFocus: false,
    });

  const {data: contractStatistics} = useContractStatistics(filters, {
    keepPreviousData: true,
  });

  const {data: defaultContractStatistics} = useContractStatistics(
    defaultFilters,
    {
      keepPreviousData: true,
    },
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

  // Combine jobTypes and the filtered oldJobTypes
  const allJobTypes = [...(jobTypes || []), ...(filteredOldJobTypes || [])];

  const handleCustomerCellClick = (id: string) => () => {
    navigate(`/customers/details/${id}?tab=0`);
  };

  const COLUMNS = useMemo<TableColumnWithRender<ContractTableRow>[]>(
    () => [
      {
        headerName: 'Customer',
        key: 'contract-cell-customer',
        width: '212px',
        fieldName: ContractOrderField.PROPERTY_OWNER_NAME,
        isFirst: true, // remove when checkbox are present with bulk action
        showShadows: showRightShadow ? 'right' : undefined,
        getExportValue: (contract) => contract.propertyOwner.name || '',
        renderCell: (contract, cellProps) => (
          <Cell
            {...cellProps}
            onClick={handleCustomerCellClick(contract.propertyOwner.id)}>
            <Avatar
              labelStyles={{
                color: theme.palette.primary.light,
              }}
              key={`company-avatar-${contract.propertyOwner.id}`}
              userAccount={{firstName: contract.propertyOwner?.name || '-'}}
            />
          </Cell>
        ),
      },
      {
        headerName: 'Number',
        key: 'contract-cell-number',
        fieldName: ContractOrderField.EXTERNAL_ID,
        width: '124px',
        getExportValue: (contract) => contract.number,
        renderCell: (contract, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{contract.number}</TableCellText>
          </Cell>
        ),
      },

      {
        headerName: 'Contract name',
        key: 'contract-cell-contract-name',
        fieldName: ContractOrderField.NAME,
        getExportValue: (contract) => contract.contractName,
        renderCell: (contract, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{contract.contractName}</TableCellText>
          </Cell>
        ),
      },

      {
        headerName: '# of units',
        key: 'contract-cell-number-of-units',
        width: '132px',
        align: 'right',
        textTransform: false,
        fieldName: ContractOrderField.NUMBER_OF_ELEVATOR,
        getExportValue: (contract) =>
          contract.numberOfUnits ? `${contract.numberOfUnits}` : '',
        renderCell: (contract, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{contract.numberOfUnits}</TableCellText>
          </Cell>
        ),
      },

      {
        headerName: 'Value',
        key: 'contract-cell-value',
        width: '132px',
        align: 'right',
        fieldName: ContractOrderField.NET_PRICE,
        getExportValue: (contract) => contract.price || '',
        renderCell: (contract, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{contract.price || '-'}</TableCellText>
          </Cell>
        ),
      },

      {
        headerName: 'Start date',
        key: 'contract-cell-start-date',
        width: '132px',
        align: 'right',
        fieldName: ContractOrderField.START_DATE,
        getExportValue: (contract) => contract.startDate,
        renderCell: (contract, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{formatDate(contract.startDate)}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'End date',
        key: 'contract-cell-end-date',
        width: '132px',
        align: 'right',
        fieldName: ContractOrderField.END_DATE,
        getExportValue: (contract) => contract.endDate,
        renderCell: (contract, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{formatDate(contract.endDate)}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Status',
        key: 'contract-cell-status',
        width: '142px',
        align: 'center',
        fieldName: ContractOrderField.STATUS,
        getExportValue: (contract) =>
          t(getContractStatusStyles(contract.status).label),
        renderCell: (contract, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText component="div">
              <StatusChip
                label={getContractStatusStyles(contract.status).label}
                color={getContractStatusStyles(contract.status).color}
                variant="filled"
                size="small"
                maxChars={9}
              />
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'action',
        key: 'contract-cell-action',
        isHeaderNameHidden: true,
        align: 'center',
        width: ACTION_CELL_WIDTH, // set static width that will not change
        isLast: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        noPadding: true,
        renderCell: (contract, cellProps) => (
          <Cell {...cellProps} onClick={undefined}>
            <Actions contract={contract.data} />
          </Cell>
        ),
      },
    ],
    [showLeftShadow, showRightShadow],
  );

  // filter intermediate state
  const {handleSubmit, setValue, watch, control} = useForm<ContractFilterForm>({
    defaultValues: {
      customer: selectedCustomer,
      unitId: selectedUnitId,
      serialNumber: selectedSerialNumber,
      jobTypes: selectedJobTypes,
      netAmountMax,
      netAmountMin,
      numberOfUnitsMin,
      numberOfUnitsMax,
      triggerMonths: selectedTriggerMonths,
    },
    mode: 'all',
  });

  const watchCustomer = watch('customer');
  const watchUnitId = watch('unitId');
  const watchSerialNumber = watch('serialNumber');
  const watchJobTypes = watch('jobTypes');
  const watchNetAmountMin = watch('netAmountMin');
  const watchNetAmountMax = watch('netAmountMax');
  const watchNumberOfUnitsMin = watch('numberOfUnitsMin');
  const watchNumberOfUnitsMax = watch('numberOfUnitsMax');
  const watchTriggerMonths = watch('triggerMonths');

  const handleSelectedOrderTypesChange = useCallback(
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

  const rows = useMemo(
    () => aggregateContractRow(contractResource.data, currentCurrency),
    [contractResource, currentCurrency],
  );

  const handleFilterApply: SubmitHandler<ContractFilterForm> = (data) => {
    setSelectedCustomer(data.customer);
    setSelectedUnitId(data.unitId);
    setSelectedSerialNumber(data.serialNumber);
    setSelectedJobTypes(data.jobTypes);
    setNetAmountMin(data.netAmountMin);
    setNetAmountMax(data.netAmountMax);
    setNumberOfUnitsMin(data.numberOfUnitsMin);
    setNumberOfUnitsMax(data.numberOfUnitsMax);
    setSelectedTriggerMonths(data.triggerMonths);
  };

  const handleFilterOpen = () => {
    setValue('customer', selectedCustomer);
    setValue('unitId', selectedUnitId);
    setValue('serialNumber', selectedSerialNumber);
    setValue('jobTypes', selectedJobTypes);
    setValue('netAmountMin', netAmountMin);
    setValue('netAmountMax', netAmountMax);
    setValue('numberOfUnitsMin', numberOfUnitsMin);
    setValue('numberOfUnitsMax', numberOfUnitsMax);
    setValue('triggerMonths', selectedTriggerMonths);
  };

  const handleFilterReset = () => {
    setValue('customer', undefined);
    setValue('unitId', undefined);
    setValue('serialNumber', undefined);
    setValue('jobTypes', []);
    setValue('netAmountMin', undefined);
    setValue('netAmountMax', undefined);
    setValue('numberOfUnitsMin', undefined);
    setValue('numberOfUnitsMax', undefined);
    setValue('triggerMonths', []);
  };

  const appliedFilterNumber = useMemo(
    () =>
      // string
      [selectedCustomer, selectedUnitId, selectedSerialNumber].filter(
        (field) => !!field,
      ).length +
      // array
      [selectedJobTypes, selectedTriggerMonths].filter(
        (field) => field.length > 0,
      ).length +
      // number
      [netAmountMin, netAmountMax].filter((field) => !!field && field > 0)
        .length,
    [
      selectedCustomer,
      selectedUnitId,
      selectedSerialNumber,
      selectedJobTypes,
      selectedTriggerMonths,
      netAmountMin,
      netAmountMax,
    ],
  );

  const handleNavigateToNewContract = () => {
    navigate('/contracts/new');
  };

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleRowClick = (id: string) => () => {
    navigate(`/contracts/details/${id}`);
  };

  const handleSortField = (fieldName: string) => {
    const order = toggleOrder(
      orderByField === fieldName ? sortOrder : undefined,
    );
    updateValues({
      orderByField: order ? (fieldName as ContractOrderField) : undefined,
      sortOrder: order,
    });
  };

  const handleQuickFilterChange = (value: string) => {
    // when selecting ALL values remove all other selections
    if (value === 'ALL') {
      setSelectedStatus(
        selectedStatus.length === 1 &&
          selectedStatus[0] === CONTRACT_STATUS_FILTER.ALL
          ? []
          : [CONTRACT_STATUS_FILTER.ALL],
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
        ) as CONTRACT_STATUS_FILTER[],
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
        ? [CONTRACT_STATUS_FILTER.ALL]
        : (newValues as CONTRACT_STATUS_FILTER[]),
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

  const handleExport = useExportTableSheet<ContractTableRow, ContractView>({
    excludedFields: ['contract-cell-action'],
    refetchCallback: refetchAllContracts,
    columns: COLUMNS,
    aggregateCallback: (data) => aggregateContractRow(data, currentCurrency),
    fileName: 'Contracts',
  });

  const aggregatedContractStatistics = useMemo(() => {
    if (!contractStatistics) return undefined;

    return reduce(
      contractStatistics.numOfContractsPerStatus,
      (acc: Record<string, number>, amount, currentStatus) => {
        const statusToUpdate = mapStatusToFilterOptions(
          currentStatus as ContractStatus,
        );

        acc[statusToUpdate] = (acc[statusToUpdate] ?? 0) + amount;
        acc[CONTRACT_STATUS_FILTER.ALL] =
          (acc[CONTRACT_STATUS_FILTER.ALL] ?? 0) + amount;
        return acc;
      },
      {},
    );
  }, [contractStatistics]);

  const filteredJobTypes = useMemo(
    () =>
      filterServiceOrderTypes({
        statistic: defaultContractStatistics?.numOfContractsPerOrderType,
        allServiceOrderTypes: allJobTypes,
      }),
    [contractStatistics, allJobTypes],
  );

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = search;
    }
  }, []);

  const {emptyTable, noMatchingData} = useMemo(() => {
    if (!isFetched) return {emptyTable: false, noMatchingData: false};

    if (
      (appliedFilterNumber > 0 ||
        selectedStatus.length > 0 ||
        selectedStartDate ||
        selectedEndDate ||
        !!search) &&
      contractResource.total === 0
    ) {
      return {emptyTable: false, noMatchingData: true};
    }

    // when the user does not have filters applied and there are no entries for the table
    if (contractResource.total === 0) {
      return {emptyTable: true, noMatchingData: false};
    }

    return {emptyTable: false, noMatchingData: false};
  }, [appliedFilterNumber, isFetched, contractResource]);

  useEffect(() => {
    if (contractResource.total > 0 && contractResource.data.length === 0) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
  }, [search, selectedStatus, contractResource]);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (emptyTable) {
    return (
      <EmptyTable
        illustration="contacts"
        label="No contacts"
        subLabel="Create a new contract to automate services and streamline job creation."
        btnLabel="New Contract"
        onClick={handleNavigateToNewContract}
      />
    );
  }

  return (
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
                name="customer"
                render={({field}) => (
                  <CustomerInput
                    selectedValue={watchCustomer}
                    isSetValueFromParent
                    onChange={field.onChange}
                  />
                )}
              />

              <Box sx={{display: 'flex'}} gap={1.5}>
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

                <Controller
                  control={control}
                  name="serialNumber"
                  render={({field}) => (
                    <PropertyInput
                      selectedValue={watchSerialNumber}
                      onChange={field.onChange}
                      type={PropertyType.ELEVATOR_SERIAL_NUMBER}
                      labelKey="Serial number"
                      placeholderKey="Select serial number"
                    />
                  )}
                />
              </Box>

              <ChipSelector
                headerLabel="SERVICE TYPE"
                options={filteredJobTypes.map((jobType) => ({
                  value: jobType.name,
                  labelKey:
                    serviceOrderTypeToString(jobType?.givenName!) === '-'
                      ? jobType?.givenName!
                      : t(serviceOrderTypeToString(jobType?.givenName!)),
                }))}
                selectedChips={watchJobTypes}
                onChange={handleSelectedOrderTypesChange}
              />

              <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
                <Typography variant="subtitle2">{t('Net amount')}</Typography>

                <Box sx={{display: 'flex'}} gap={1}>
                  <Controller
                    control={control}
                    name="netAmountMin"
                    render={({field}) => (
                      <TextInput
                        value={watchNetAmountMin ? `${watchNetAmountMin}` : ''}
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
                        value={watchNetAmountMax ? `${watchNetAmountMax}` : ''}
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

              <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
                <Typography variant="subtitle2">
                  {t('Number of units')}
                </Typography>

                <Box sx={{display: 'flex'}} gap={1}>
                  <Controller
                    control={control}
                    name="numberOfUnitsMin"
                    render={({field}) => (
                      <TextInput
                        value={
                          watchNumberOfUnitsMin
                            ? `${watchNumberOfUnitsMin}`
                            : ''
                        }
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
                    name="numberOfUnitsMax"
                    render={({field}) => (
                      <TextInput
                        value={
                          watchNumberOfUnitsMax
                            ? `${watchNumberOfUnitsMax}`
                            : ''
                        }
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

              <Controller
                control={control}
                name="triggerMonths"
                render={({field}) => (
                  <MonthInput
                    selectedValue={watchTriggerMonths}
                    onChange={field.onChange}
                  />
                )}
              />
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
                disabled: isFetchingAllContracts,
              }}
              style={{
                borderColor: 'text.primary',
                height: '36px',
                paddingTop: 0,
              }}>
              {isFetchingAllContracts ? (
                <CircularProgress size="1rem" sx={{mr: 1}} />
              ) : null}
              <Box pt={0.5}>{t('Export')}</Box>
            </Button>
          )}
          <AddButton
            label="New Contract"
            onClick={handleNavigateToNewContract}
          />
        </Box>
      </PageHeaderContainer>
      <Box>
        <QuickFilter
          selected={selectedStatus ?? null}
          options={QUICK_FILTER_OPTIONS}
          statistics={aggregatedContractStatistics}
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
              key={`contract-row-${entry.id}`}
              testId={`contract-row-${entry.id}`}>
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
        currentIndex={contractResource.page.pageIndex}
        numberOfElementsPerPage={contractResource.page.pageSize}
        totalEntries={contractResource.total}
        onChange={handlePageIndexChange}
        onNumberPerPageChange={handleChangeElementsPerPage}
      />
    </PageContainer>
  );
};

export default Contracts;
