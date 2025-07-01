import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DISTANCE_FILTER,
  ElevatorOrderField,
  ElevatorQueryParams,
  ElevatorStatus,
  ElevatorStatusFilter,
  ElevatorView,
  STATUS_COLOR,
  TABLE_COLUMNS_ID,
  UNIT_TABLE_COLUMNS,
  UnitFilterForm,
  UnitTableRow,
} from 'models/elevator';
import {createEmptyResource, makePage, toggleOrder} from 'utils/paging';
import {
  useAllElevators,
  useAllUnits,
  useUnitStatistics,
} from 'hooks/reactQuery/useElevator';
import {Progress} from 'components/Progress';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {useNavigate} from 'react-router-dom';
import Box from '@mui/material/Box';
import {useSearchValues} from 'hooks/useSearchValues';
import EmptyTable from 'components/Table/EmptyTable';
import {ReactComponent as CalendarVectorIcon} from 'assets/icons/CalendarVector.svg';
import {
  aggregateUnitRow,
  createSearchQuery,
  getDistanceFromOption,
  getStatusString,
} from 'utils/elevator-utils';
import PageHeaderContainer from 'components/PageHeaderContainer';
import SearchInput from 'components/SearchInput/index';
import Filters from 'components/Filters';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import TextInput from 'components/TextInput';
import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  TableBody,
  Typography,
} from '@mui/material';
import QuickFilter from 'components/QuickFilter';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import TableRow from 'components/Table/TableRow';
import Pagination from 'components/Pagination';
import {
  CustomizableTable,
  NOTES_CELL_WIDTH,
  TableColumnWithRender,
} from 'models/table';
import Cell from 'components/Table/TableCell';
import TableCellText from 'components/Table/TableCellText';
import {theme} from 'theme';
import {convertToText, getUserFullName} from 'utils/utils';
import AvatarGroup from 'components/AvatarGroup';
import {Avatar} from 'components/Avatar';
import {StatusChip} from 'components/StatusChip';
import {olStyles} from 'styles';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {NoteAltOutlined} from '@mui/icons-material';
import {Order, OrderByParams} from 'models/pagination';
import {useTranslation} from 'react-i18next';
import {OptionWithTranslationKey} from 'models/filter';
import AddButton from 'components/AddButton';
import {useGetTechniciansByEmployeeId} from 'hooks/reactQuery/useTechnician';
import {reduce} from 'lodash';
import {Button} from 'components/Button';
import CustomerInput from 'components/Inputs/CustomerInput';
import TechnicianInput from 'components/Inputs/TechnicianInput';
import {
  DEFAULT_DATE_FORMAT,
  fromDateStringToDate,
  toRestDate,
} from 'utils/datetime';
import Tooltip from '@mui/material/Tooltip';
import DatePickerRange from 'components/DatePickerRange';
import {DateRange} from '@mui/x-date-pickers-pro';
import UnitIdInput from 'components/Inputs/UnitInput/UnitIdInput';
import {
  ServiceOrderStatusFilter,
  ServiceOrderStatusToFilter,
} from 'models/service-order';
import {ContractStatus} from 'models/contract';
import PropertyInput from 'components/Inputs/PropertyInput';
import {PropertyType} from 'models/valueProperty';
import {
  createQuickFilterOptions,
  filterOutQuickFilterOptions,
} from 'utils/filter';
import CustomizeTable from 'components/Table/CustomizeTable';
import useCustomizableColumns from 'hooks/useCustomizableColumns';
import {useExportTableSheet} from 'hooks/useExport';
import TableCellTextWithTooltip from 'components/Table/TableCellTextWithTooltip';
import {convertPropertyOwnerObjectToAvatar} from 'utils/account-utils';

const pageInfo = makePage(0, 50);

const QUICK_FILTER_OPTIONS: OptionWithTranslationKey[] =
  createQuickFilterOptions(ElevatorStatusFilter);

const DISTANCE_OPTION: OptionWithTranslationKey[] = [
  {value: DISTANCE_FILTER.FIVE, labelKey: '+5km'},
  {value: DISTANCE_FILTER.TEN, labelKey: '+10km'},
  {value: DISTANCE_FILTER.TWENTY, labelKey: '+20km'},
];

export const UnitListingView = () => {
  const navigate = useNavigate();
  const formatDate = useFormatDate();
  const {t} = useTranslation();
  const {selectedTableColumns, fixedTableColumns} = useCustomizableColumns(
    CustomizableTable.UNIT,
    UNIT_TABLE_COLUMNS,
  );

  const [selectedStatus, setSelectedStatus] = useQueryState<
    ElevatorStatusFilter[]
  >('selectedStatus', {
    defaultValue: [],
  });

  const [selectedAddress, setSelectedAddress] = useQueryState<
    string | undefined
  >('selectedAddress', {
    defaultValue: undefined,
  });

  const [selectedDistance, setSelectedDistance] = useQueryState<
    DISTANCE_FILTER | undefined
  >('selectedDistance', {
    defaultValue: undefined,
  });

  const [selectedLastInspectionStart, setSelectedLastInspectionStart] =
    useQueryState<string | undefined>('selectedLastInspectionStart', {
      defaultValue: undefined,
    });

  const [selectedLastInspectionEnd, setSelectedLastInspectionEnd] =
    useQueryState<string | undefined>('selectedLastInspectionEnd', {
      defaultValue: undefined,
    });

  const [selectedNextInspectionStart, setSelectedNextInspectionStart] =
    useQueryState<string | undefined>('selectedNextInspectionStart', {
      defaultValue: undefined,
    });

  const [selectedNextInspectionEnd, setSelectedNextInspectionEnd] =
    useQueryState<string | undefined>('selectedNextInspectionEnd', {
      defaultValue: undefined,
    });

  const [selectedTechnicianId, setSelectedTechnicianId] = useQueryState<
    string | undefined
  >('selectedTechnicianId', {defaultValue: undefined});

  const [selectedFabricNumber, setSelectedFabricNumber] = useQueryState<
    string | undefined
  >('selectedFabricNumber', {defaultValue: undefined});

  const [selectedModelNumber, setSelectedModelNumber] = useQueryState<
    string | undefined
  >('selectedModelNumber', {defaultValue: undefined});

  const [selectedUnitCategory, setSelectedUnitCategory] = useQueryState<
    string | undefined
  >('selectedUnitCategory', {defaultValue: undefined});

  const [selectedUnitNumber, setSelectedUnitNumber] = useQueryState<
    string | undefined
  >('selectedUnitNumber', {defaultValue: undefined});

  const [selectedCustomer, setSelectedCustomer] = useQueryState<
    string | undefined
  >('selectedCustomer', {defaultValue: undefined});

  const [hasActiveContract, setHasActiveContract] = useQueryState<
    string | undefined
  >('hasActiveContract', {
    defaultValue: undefined,
  });

  const [hasTodos, setHasTodos] = useQueryState<string | undefined>(
    'hasTodos',
    {
      defaultValue: undefined,
    },
  );

  const [search, setSearch] = useQueryState('searchUnits');
  const [page, setPage] = useQueryState('page', {defaultValue: pageInfo});

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textInput = useRef<HTMLInputElement>(null);

  const {
    values: {sortOrder, orderByField},
    updateValues,
  } = useSearchValues<OrderByParams<ElevatorOrderField>>();

  const query = useMemo(
    () =>
      createSearchQuery({
        search,
        address: selectedAddress,
      }),
    [search, selectedAddress],
  );

  const filters: Partial<ElevatorQueryParams> = {
    ...(query && {query}),
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    orderBy: orderByField || ElevatorOrderField.CREATED_TIME,
    order: sortOrder || Order.DESC,
    status: selectedStatus.includes(ElevatorStatusFilter.ALL)
      ? []
      : (selectedStatus as unknown as ElevatorStatus[]), // as filter values and statuses are almost identical we can cast
    ...(hasActiveContract === 'true' && {
      contractStatus: [ContractStatus.VALID, ContractStatus.EXPIRING],
    }),
    ...(selectedCustomer && {propertyOwnerId: [selectedCustomer]}),
    ...(selectedTechnicianId && {technicianId: [selectedTechnicianId]}),
    ...(selectedAddress &&
      selectedDistance &&
      getDistanceFromOption(selectedDistance)),
    ...(selectedUnitNumber && {externalId: [selectedUnitNumber]}),
    ...(selectedUnitCategory && {category: [selectedUnitCategory]}),
    ...(selectedModelNumber && {model: [selectedModelNumber]}),
    ...(selectedFabricNumber && {serialNumber: [selectedFabricNumber]}),
    ...(selectedLastInspectionStart && {
      lastInspectionStart: selectedLastInspectionStart,
    }),
    ...(selectedLastInspectionEnd && {
      lastInspectionEnd: selectedLastInspectionEnd,
    }),
    ...(selectedNextInspectionStart && {
      nextInspectionStart: selectedNextInspectionStart,
    }),
    ...(selectedNextInspectionEnd && {
      nextInspectionEnd: selectedNextInspectionEnd,
    }),
    ...(hasTodos === 'true' && {
      hasTodo: true,
    }),
  };

  const {
    data: elevatorResponse = createEmptyResource<ElevatorView>(10),
    isLoading,
    isFetched,
  } = useAllElevators(filters, {keepPreviousData: true});

  const {data: unitStatistics} = useUnitStatistics(filters, {
    keepPreviousData: true,
  });

  const handleCustomerCellClick = (id: string) => {
    navigate(`/customers/details/${id}?tab=0`);
  };

  const COLUMNS = useMemo<TableColumnWithRender<UnitTableRow>[]>(
    (): TableColumnWithRender<UnitTableRow>[] => [
      {
        id: TABLE_COLUMNS_ID.NUMBER,
        headerName: 'Number',
        key: 'unit-cell-number',
        fieldName: ElevatorOrderField.EXTERNAL_ID,
        isFirst: true, // remove when checkbox are present with bulk action
        showShadows: showRightShadow ? 'right' : undefined,
        getExportValue: (unit) => unit.number,
        renderCell: (unit, cellProps) => (
          <Cell {...cellProps}>
            <TableCellTextWithTooltip
              mainContent={unit.number}
              showSecondaryContent={
                unit.data.additionalInfo?.customerAppointment
                  ?.requiresAppointment || false
              }
              secondaryContent={
                unit.data.additionalInfo?.customerAppointment?.description || ''
              }
              secondaryIcon={
                <CalendarVectorIcon
                  fontSize="large"
                  color="action"
                  style={{cursor: 'pointer', marginLeft: '0.4em'}}
                />
              }
            />
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.ADDRESS,
        headerName: 'Address',
        key: 'unit-cell-address',
        fieldName: ElevatorOrderField.ADDRESS,
        getExportValue: (unit) => unit.fullAddress || '',
        renderCell: (unit, cellProps) => (
          <Cell {...cellProps}>
            <Tooltip
              title={
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  gap={theme.spacing(0.5)}>
                  <Typography
                    sx={{
                      lineHeight: '14px',
                      fontSize: '10px',
                    }}>
                    {unit.fullAddress ? unit.fullAddress : '-'}
                  </Typography>
                </Box>
              }
              placement="top"
              arrow>
              <Box>
                <TableCellText>
                  {unit.address as unknown as ReactElement<ReactNode>}
                </TableCellText>
              </Box>
            </Tooltip>
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.BUILDING,
        headerName: 'Building',
        key: 'unit-cell-building',
        fieldName: ElevatorOrderField.BUILDING_LOCATION,
        getExportValue: (unit) => unit.building,
        renderCell: (unit, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{unit.building}</TableCellText>
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.CUSTOMER,
        headerName: 'Customer',
        key: 'unit-cell-customer',
        width: '212px',
        textTransform: false,
        fieldName: ElevatorOrderField.PROPERTY_OWNER_NAME,
        getExportValue: (unit) => unit.propertyOwner?.name || '',
        renderCell: (unit, cellProps) => (
          <Cell
            {...cellProps}
            onClick={() => {
              if (unit.propertyOwner?.id)
                handleCustomerCellClick(unit.propertyOwner.id);
            }}>
            <Avatar
              labelStyles={{
                color: theme.palette.primary.light,
              }}
              key={`company-avatar-${unit.id}`}
              userAccount={
                unit.propertyOwner
                  ? convertPropertyOwnerObjectToAvatar(unit.propertyOwner)
                  : {}
              }
            />
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.LAST_VISIT,
        headerName: 'Last visit',
        key: 'unit-cell-last-visit',
        width: '132px',
        textTransform: false,
        fieldName: ElevatorOrderField.LAST_VISIT_DATE,
        getExportValue: (unit) =>
          (unit.lastVisitDate
            ? formatDate(
                fromDateStringToDate(unit.lastVisitDate, DEFAULT_DATE_FORMAT),
              )
            : undefined) ?? '',
        renderCell: (unit, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {unit.lastVisitDate
                ? formatDate(
                    fromDateStringToDate(
                      unit.lastVisitDate,
                      DEFAULT_DATE_FORMAT,
                    ),
                  )
                : '-'}
            </TableCellText>
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.ENGINEERS,
        headerName: 'Engineer',
        key: 'unit-cell-engineer',
        width: '212px',
        textTransform: false,
        fieldName: ElevatorOrderField.ASSIGNED_TECHNICIAN_NAMES,
        getExportValue: (unit) =>
          unit.engineers.length > 0
            ? unit.engineers
                .map((technician) => getUserFullName(technician.userAccount))
                .join(', ')
            : '',
        renderCell: (serviceOrder, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText component="div">
              <AvatarGroup
                employees={serviceOrder.engineers.map(
                  (technician) => technician.userAccount,
                )}
              />
            </TableCellText>
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.ACTIVE_CONTRACTS,
        headerName: 'Contract',
        key: 'unit-cell-contract',
        width: NOTES_CELL_WIDTH,
        textTransform: false,
        align: 'center',
        fieldName: ElevatorOrderField.NUMBER_OF_CONTRACTS,
        renderCell: (unit, cellProps) => (
          <Cell {...cellProps} noWidthLimit>
            {unit.hasContract ? (
              <NoteAlt fontSize="small" />
            ) : (
              <NoteAltOutlined fontSize="small" />
            )}
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.STATUS,
        headerName: 'Status',
        textTransform: false,
        key: 'unit-cell-status',
        width: '142px',
        align: 'center',
        fieldName: ElevatorOrderField.STATUS,
        getExportValue: (unit) => t(getStatusString(unit.status)),
        renderCell: (unit, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText component="div">
              <StatusChip
                color={
                  unit.status === ElevatorStatus.UNKNOWN
                    ? theme.palette.primary.dark
                    : theme.palette.primary.contrastText
                }
                style={olStyles.orderStatus}
                bgColor={STATUS_COLOR[unit.status]}
                label={getStatusString(unit.status)}
                variant="filled"
              />
            </TableCellText>
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.SERIAL_NUMBER,
        headerName: 'Serial number',
        textTransform: false,
        key: 'unit-cell-serial-number',
        width: '142px',
        fieldName: ElevatorOrderField.SERIAL_NUMBER,
        getExportValue: (unit) => unit.serialNumber,
        renderCell: (unit, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText component="div">{unit.serialNumber}</TableCellText>
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.MANUFACTURER,
        headerName: 'Manufacturer',
        textTransform: false,
        key: 'unit-cell-manufacturer',
        width: '142px',
        fieldName: ElevatorOrderField.MANUFACTURER,
        getExportValue: (unit) => unit.manufacturer,
        renderCell: (unit, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{unit.manufacturer}</TableCellText>
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.MODEL,
        headerName: 'Model',
        textTransform: false,
        key: 'unit-cell-model',
        width: '142px',
        fieldName: ElevatorOrderField.MODEL,
        getExportValue: (unit) => unit.model,
        renderCell: (unit, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{unit.model}</TableCellText>
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.LAST_INSPECTION,
        headerName: 'Last inspection',
        textTransform: false,
        key: 'unit-cell-last-inspection',
        width: '132px',
        fieldName: ElevatorOrderField.LAST_INSPECTION_DATE,
        getExportValue: (unit) =>
          (unit.lastInspectionDate
            ? formatDate(
                fromDateStringToDate(
                  unit.lastInspectionDate,
                  DEFAULT_DATE_FORMAT,
                ),
              )
            : undefined) ?? '',
        renderCell: (unit, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              {unit.lastInspectionDate
                ? formatDate(
                    fromDateStringToDate(
                      unit.lastInspectionDate,
                      DEFAULT_DATE_FORMAT,
                    ),
                  )
                : '-'}
            </TableCellText>
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.SERVICE_TIME,
        headerName: 'Required time',
        textTransform: false,
        key: 'unit-cell-required-time',
        width: '84px',
        fieldName: ElevatorOrderField.SERVICE_TIME,
        getExportValue: (unit) => `${unit.requiredTime}`,
        renderCell: (unit, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{unit.requiredTime}</TableCellText>
          </Cell>
        ),
      },
      {
        id: TABLE_COLUMNS_ID.DISTANCE,
        headerName: 'Distance',
        textTransform: false,
        key: 'unit-cell-distance',
        width: '84px',
        fieldName: ElevatorOrderField.DISTANCE,
        getExportValue: (unit) => `${unit.distance}`,
        renderCell: (unit, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{unit.distance}</TableCellText>
          </Cell>
        ),
      },
      // {
      //   headerName: 'action',
      //   key: 'unit-cell-action',
      //   isHeaderNameHidden: true,
      //   align: 'center',
      //   width: ACTION_CELL_WIDTH, // set static width that will not change
      //   isLast: true,
      //   showShadows: showLeftShadow ? 'left' : undefined,
      //   renderCell: (unit, cellProps) => (
      //     <Cell {...cellProps} onClick={undefined}>
      //       <Actions id={unit.id} />
      //     </Cell>
      //   ),
      // },
    ],
    [showLeftShadow, showRightShadow],
  );

  const customizedColumns = useMemo(
    () =>
      COLUMNS.reduce(
        (
          acc: TableColumnWithRender<UnitTableRow>[],
          column: TableColumnWithRender<UnitTableRow>,
        ) => {
          const isColumnFixed = fixedTableColumns.some(
            (customizedColumn) => customizedColumn.id === column.id,
          );

          const isCustomizedColumnLast =
            selectedTableColumns[selectedTableColumns.length - 1] === column.id;

          const isSelectedColumn = column.id
            ? selectedTableColumns.includes(column.id)
            : false;

          const itemToAdd = isCustomizedColumnLast
            ? {
                ...column,
                isLast: true,
                lastSticky: false,
              }
            : column;

          if (isColumnFixed || isSelectedColumn) return [...acc, itemToAdd];

          return acc;
        },
        [] as TableColumnWithRender<UnitTableRow>[],
      ),
    [COLUMNS, selectedTableColumns, fixedTableColumns],
  );

  const {data: selectedTechnician} =
    useGetTechniciansByEmployeeId(selectedTechnicianId);

  // filter intermediate state
  const {handleSubmit, setValue, watch, control} = useForm<UnitFilterForm>({
    defaultValues: {
      address: selectedAddress,
      distance: selectedDistance,
      lastInspectionStart: selectedLastInspectionStart,
      lastInspectionEnd: selectedLastInspectionEnd,
      nextInspectionStart: selectedNextInspectionStart,
      nextInspectionEnd: selectedNextInspectionEnd,
      technician: selectedTechnician,
      unitNumber: selectedUnitNumber,
      fabricNumber: selectedFabricNumber,
      modelNumber: selectedModelNumber,
      unitCategory: selectedUnitCategory,
      hasActiveContract: hasActiveContract === 'true',
      hasTodos: hasTodos === 'true',
      customer: selectedCustomer,
    },
    mode: 'all',
  });

  const watchDistance = watch('distance');
  const watchCustomer = watch('customer');
  const watchTechnician = watch('technician');
  const watchUnitNumber = watch('unitNumber');
  const watchFabricNumber = watch('fabricNumber');
  const watchModelNumber = watch('modelNumber');
  const watchUnitCategory = watch('unitCategory');
  const watchLastInspectionStart = watch('lastInspectionStart');
  const watchLastInspectionEnd = watch('lastInspectionEnd');
  const watchNextInspectionStart = watch('nextInspectionStart');
  const watchNextInspectionEnd = watch('nextInspectionEnd');
  const watchHasActiveContracts = watch('hasActiveContract');
  const watchHasTodos = watch('hasTodos');

  const rows = useMemo(
    () => aggregateUnitRow(elevatorResponse.data),
    [elevatorResponse],
  );

  const appliedFilterNumber = useMemo(
    () =>
      [
        selectedAddress,
        selectedCustomer,
        selectedFabricNumber,
        selectedTechnician,
        selectedModelNumber,
        selectedUnitCategory,
        selectedUnitNumber,
        hasTodos,
        hasActiveContract,
      ].filter((field) => !!field).length +
      ([selectedLastInspectionStart, selectedLastInspectionEnd].some(
        (field) => !!field,
      )
        ? 1
        : 0) +
      ([selectedNextInspectionStart, selectedNextInspectionEnd].some(
        (field) => !!field,
      )
        ? 1
        : 0),
    [
      selectedAddress,
      selectedCustomer,
      selectedFabricNumber,
      selectedTechnician,
      selectedModelNumber,
      selectedUnitCategory,
      selectedUnitNumber,
      hasTodos,
      hasActiveContract,
      selectedLastInspectionStart,
      selectedLastInspectionEnd,
      selectedNextInspectionStart,
      selectedNextInspectionEnd,
    ],
  );

  const {emptyTable, noMatchingData} = useMemo(() => {
    if (!isFetched) return {emptyTable: false, noMatchingData: false};

    if (
      (appliedFilterNumber > 0 || selectedStatus.length > 0 || !!search) &&
      elevatorResponse.total === 0
    ) {
      return {emptyTable: false, noMatchingData: true};
    }

    // when the user does not have filters applied and there are no entries for the table
    if (elevatorResponse.total === 0) {
      return {emptyTable: true, noMatchingData: false};
    }

    return {emptyTable: false, noMatchingData: false};
  }, [appliedFilterNumber, isFetched, elevatorResponse, search]);

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleRowClick = (id: string) => () => {
    navigate(`/units/details/${id}`);
  };

  const handleSortField = (fieldName: string) => {
    const order = toggleOrder(
      orderByField === fieldName ? sortOrder : undefined,
    );
    updateValues({
      orderByField: order ? (fieldName as ElevatorOrderField) : undefined,
      sortOrder: order,
    });
  };

  const handleQuickFilterChange = (value: string) => {
    // when selecting ALL values remove all other selections
    if (value === 'ALL') {
      setSelectedStatus([ElevatorStatusFilter.ALL]);
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
        ) as ElevatorStatusFilter[],
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
        ? [ElevatorStatusFilter.ALL]
        : (newValues as ElevatorStatusFilter[]),
    );
  };

  const handleFilterOpen = () => {
    setValue('address', selectedAddress);
    setValue('distance', selectedDistance);
    setValue('lastInspectionStart', selectedLastInspectionStart);
    setValue('lastInspectionEnd', selectedLastInspectionEnd);
    setValue('nextInspectionStart', selectedNextInspectionStart);
    setValue('nextInspectionEnd', selectedNextInspectionEnd);
    setValue('technician', selectedTechnician);
    setValue('unitNumber', selectedUnitNumber);
    setValue('fabricNumber', selectedFabricNumber);
    setValue('modelNumber', selectedModelNumber);
    setValue('unitCategory', selectedUnitCategory);
    setValue('hasActiveContract', hasActiveContract === 'true');
    setValue('hasTodos', hasTodos === 'true');
    setValue('customer', selectedCustomer);
  };

  const handleFilterReset = () => {
    setSelectedAddress(undefined);
    setSelectedDistance(undefined);
    setSelectedLastInspectionStart(undefined);
    setSelectedLastInspectionEnd(undefined);
    setSelectedNextInspectionStart(undefined);
    setSelectedNextInspectionEnd(undefined);
    setSelectedTechnicianId(undefined);
    setSelectedUnitNumber(undefined);
    setSelectedFabricNumber(undefined);
    setSelectedModelNumber(undefined);
    setSelectedUnitCategory(undefined);
    setHasActiveContract(undefined);
    setHasTodos(undefined);
    setSelectedCustomer(undefined);
  };

  const handleFilterApply: SubmitHandler<UnitFilterForm> = (data) => {
    setSelectedAddress(data.address);
    setSelectedDistance(data.distance);
    setSelectedLastInspectionStart(data.lastInspectionStart);
    setSelectedLastInspectionEnd(data.lastInspectionEnd);
    setSelectedNextInspectionStart(data.nextInspectionStart);
    setSelectedNextInspectionEnd(data.nextInspectionEnd);
    setSelectedTechnicianId(data.technician?.id);
    setSelectedUnitNumber(data.unitNumber);
    setSelectedFabricNumber(data.fabricNumber);
    setSelectedModelNumber(data.modelNumber);
    setSelectedUnitCategory(data.unitCategory);
    setHasActiveContract(data.hasActiveContract ? 'true' : undefined);
    setHasTodos(data.hasTodos ? 'true' : undefined);
    setSelectedCustomer(data.customer);
  };

  const {refetch: refetchAllUnits, isFetching: isFetchingAllUnits} =
    useAllUnits(filters, {
      enabled: false,
      refetchOnWindowFocus: false,
    });

  const handleExport = useExportTableSheet<UnitTableRow, ElevatorView>({
    excludedFields: ['unit-cell-contract', 'unit-cell-action'],
    refetchCallback: refetchAllUnits,
    columns: customizedColumns,
    aggregateCallback: aggregateUnitRow,
    fileName: 'Units',
  });

  const handleChangeDateRange =
    (formKey: 'lastInspection' | 'nextInspection') =>
    (dateRange: DateRange<Date>) => {
      const startDate = dateRange?.[0] ? toRestDate(dateRange?.[0]) : undefined;
      const endDate = dateRange?.[1] ? toRestDate(dateRange?.[1]) : undefined;

      setValue(`${formKey}Start`, startDate);
      setValue(`${formKey}End`, endDate || startDate);
    };

  const handleClearDateSelection =
    (formKey: 'lastInspection' | 'nextInspection') => () => {
      setValue(`${formKey}Start`, undefined);
      setValue(`${formKey}End`, undefined);
    };

  const navigateToNewUnit = () => {
    navigate('/units/new');
  };

  const aggregatedUnitStatistics = useMemo(() => {
    if (!unitStatistics) return undefined;

    return reduce(
      unitStatistics.numOfElevatorsPerStatus,
      (acc: Record<string, number>, amount, status) => {
        const mappedStatus = ServiceOrderStatusToFilter[status] ?? status;
        acc[mappedStatus] = (acc[mappedStatus] ?? 0) + amount;
        acc[ServiceOrderStatusFilter.ALL] =
          (acc[ServiceOrderStatusFilter.ALL] ?? 0) + amount;
        return acc;
      },
      {},
    );
  }, [unitStatistics]);

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = search;
    }
  }, []);

  if (isLoading) {
    return <Progress />;
  }

  if (emptyTable) {
    return (
      <EmptyTable
        illustration="lift"
        label="No units"
        subLabel="Add a new unit and assign it to a job"
        btnLabel="New Unit"
        onClick={navigateToNewUnit}
      />
    );
  }

  return (
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
      }}>
      <PageHeaderContainer>
        <Box
          sx={{
            display: 'flex',
          }}
          gap={2}>
          <SearchInput
            refInput={textInput}
            defaultValue={search}
            onChange={(val: string) => {
              setPage({
                ...page,
                pageIndex: 0,
              });
              setSearch(val);
            }}
          />
          <Filters
            activeFilters={appliedFilterNumber}
            onOpen={handleFilterOpen}
            onSave={handleSubmit(handleFilterApply)}
            onReset={handleFilterReset}>
            <Box
              sx={{display: 'flex', flexDirection: 'column', width: '100%'}}
              gap={2}>
              <Box
                sx={{display: 'flex', flexDirection: 'column', width: '100%'}}
                gap={1}>
                <Controller
                  control={control}
                  name="address"
                  render={({field}) => (
                    <TextInput
                      {...field}
                      size="small"
                      labelKey="Address"
                      placeholder="Search"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="distance"
                  render={({field}) => (
                    <RadioGroup
                      aria-labelledby="unit-distance-radio-buttons-group-label"
                      name="unit-distance-radio-buttons-group"
                      data-testid="unit-distance-radio-buttons-group">
                      <Box display="flex" gap={4}>
                        {DISTANCE_OPTION.map((distanceOption) => (
                          <FormControlLabel
                            {...field}
                            sx={{
                              gap: '8px',
                              margin: 0,

                              '& .MuiFormControlLabel-label': {
                                fontSize: '14px',
                                lineHeight: '140%' /* 19.6px */,
                                letterSpacing: '-0.15px',
                              },

                              '& .MuiRadio-root': {
                                width: '20px',
                                height: '20px',
                              },
                            }}
                            data-testid={`unit-distance-radio-button-${distanceOption.value}`}
                            control={<Radio />}
                            checked={watchDistance === distanceOption.value}
                            value={distanceOption.value}
                            label={t(distanceOption.labelKey)}
                          />
                        ))}
                      </Box>
                    </RadioGroup>
                  )}
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                }}
                gap={1.5}>
                <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
                  <Typography variant="subtitle2">
                    {t('Last inspection')}
                  </Typography>

                  <DatePickerRange
                    getSelectedDate={handleChangeDateRange('lastInspection')}
                    defaultDate={[
                      watchLastInspectionStart
                        ? new Date(watchLastInspectionStart)
                        : null,
                      watchLastInspectionEnd
                        ? new Date(watchLastInspectionEnd)
                        : null,
                    ]}
                    textFieldProps={{
                      label: '',
                      sx: {
                        width: '100%',
                      },
                    }}
                    containerStyles={{
                      '& .MuiFormControl-root': {
                        minWidth: 'auto !important',
                        color: 'red',
                      },

                      '& .MuiStack-root': {
                        padding: 0,
                      },
                    }}
                    onClear={handleClearDateSelection('lastInspection')}
                  />
                </Box>

                <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
                  <Typography variant="subtitle2">
                    {t('Next inspection')}
                  </Typography>

                  <DatePickerRange
                    getSelectedDate={handleChangeDateRange('nextInspection')}
                    defaultDate={[
                      watchNextInspectionStart
                        ? new Date(watchNextInspectionStart)
                        : null,
                      watchNextInspectionEnd
                        ? new Date(watchNextInspectionEnd)
                        : null,
                    ]}
                    textFieldProps={{
                      label: '',
                      sx: {
                        width: '100%',
                      },
                    }}
                    containerStyles={{
                      '& .MuiFormControl-root': {
                        minWidth: 'auto !important',
                        color: 'red',
                      },

                      '& .MuiStack-root': {
                        padding: 0,
                      },
                    }}
                    onClear={handleClearDateSelection('nextInspection')}
                  />
                </Box>
              </Box>

              <Controller
                control={control}
                name="technician"
                render={({field}) => (
                  <TechnicianInput
                    selectedTechnician={watchTechnician}
                    {...field}
                  />
                )}
              />

              <Box sx={{display: 'flex'}} gap={1.5}>
                <Controller
                  control={control}
                  name="unitNumber"
                  render={({field}) => (
                    <UnitIdInput
                      selectedValue={watchUnitNumber}
                      onChange={field.onChange}
                      valueMapper={(unit: ElevatorView) => unit.externalId}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="fabricNumber"
                  render={({field}) => (
                    <PropertyInput
                      selectedValue={watchFabricNumber}
                      onChange={field.onChange}
                      type={PropertyType.ELEVATOR_SERIAL_NUMBER}
                      labelKey="Serial number"
                      placeholderKey="Select serial number"
                    />
                  )}
                />
              </Box>

              <Controller
                control={control}
                name="modelNumber"
                render={({field}) => (
                  <PropertyInput
                    selectedValue={watchModelNumber}
                    onChange={field.onChange}
                    type={PropertyType.ELEVATOR_MODEL}
                    labelKey="Model number"
                    placeholderKey="Select model number"
                  />
                )}
              />

              <Controller
                control={control}
                name="unitCategory"
                render={({field}) => (
                  <PropertyInput
                    selectedValue={watchUnitCategory}
                    type={PropertyType.ELEVATOR_CATEGORY}
                    labelKey="Unit category"
                    placeholderKey="Select unit category"
                    isLabelTranslatable
                    labelTranslationCallback={(label) =>
                      t(convertToText(label))
                    }
                    onChange={field.onChange}
                  />
                )}
              />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                gap={1}>
                <Typography variant="subtitle2">
                  {t('Active contracts')}
                </Typography>
                <Controller
                  control={control}
                  name="hasActiveContract"
                  render={({field}) => (
                    <Checkbox
                      checked={watchHasActiveContracts}
                      onChange={field.onChange}
                      sx={{padding: 0}}
                    />
                  )}
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                gap={1}>
                <Typography variant="subtitle2">{t("To-do's")}</Typography>
                <Controller
                  control={control}
                  name="hasTodos"
                  render={({field}) => (
                    <Checkbox
                      checked={watchHasTodos}
                      onChange={field.onChange}
                      sx={{padding: 0}}
                    />
                  )}
                />
              </Box>

              <Controller
                control={control}
                name="customer"
                render={({field}) => (
                  <CustomerInput selectedValue={watchCustomer} {...field} />
                )}
              />
            </Box>
          </Filters>
        </Box>

        <Box display="flex" gap={2}>
          <CustomizeTable
            table={CustomizableTable.UNIT}
            allColumns={UNIT_TABLE_COLUMNS}
          />
          {rows.length > 0 && (
            <Button
              buttonProps={{
                size: 'medium',
                variant: 'outlined',
                color: 'primary',
                onClick: handleExport,
                disabled: isFetchingAllUnits,
              }}
              style={{
                borderColor: 'text.primary',
                height: '36px',
              }}>
              {isFetchingAllUnits ? (
                <CircularProgress size="1rem" sx={{mr: 1}} />
              ) : null}
              <Box pt={0.5}>{t('Export')}</Box>
            </Button>
          )}
          <AddButton label="New Unit" onClick={navigateToNewUnit} />
        </Box>
      </PageHeaderContainer>

      <Box>
        <QuickFilter
          selected={selectedStatus ?? null}
          options={QUICK_FILTER_OPTIONS}
          statistics={aggregatedUnitStatistics}
          onChange={handleQuickFilterChange}
        />
      </Box>
      <TableContainer
        showNoMatchWarning={noMatchingData}
        containerRef={containerRef}
        setShowLeftShadow={setShowLeftShadow}
        setShowRightShadow={setShowRightShadow}>
        <TableHeader
          columns={customizedColumns}
          sortState={{columnName: orderByField, order: sortOrder}}
          onSort={handleSortField}
        />

        <TableBody>
          {/* Row */}
          {rows.map((entry) => (
            <TableRow
              key={`unit-row-${entry.id}`}
              testId={`unit-row-${entry.id}`}>
              {customizedColumns.map(({renderCell, ...rest}) =>
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
        currentIndex={elevatorResponse.page.pageIndex}
        numberOfElementsPerPage={elevatorResponse.page.pageSize}
        totalEntries={elevatorResponse.total}
        onChange={handlePageIndexChange}
        onNumberPerPageChange={handleChangeElementsPerPage}
      />
    </Box>
  );
};
