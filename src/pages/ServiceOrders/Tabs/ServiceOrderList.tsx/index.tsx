import Box from '@mui/material/Box';
import {
  ServiceOrderFilterForm,
  ServiceOrderFilterToStatusMap,
  ServiceOrderOrderField,
  ServiceOrderPaymentStatus,
  ServiceOrderPaymentWithIndicationStatus,
  ServiceOrderStatusFilter,
  ServiceOrderTableRow,
  ServiceOrderType,
  ServiceOrderView,
} from 'models/service-order';
import React, {
  ChangeEvent,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  calculateTotalPages,
  createEmptyResource,
  makePage,
  toggleOrder,
} from 'utils/paging';
import {
  useServiceOrderComments,
  useServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {endOfDay, startOfDay, subDays} from 'date-fns';
import {useNavigate} from 'react-router-dom';
import {Progress} from 'components/Progress';
import {useQueryState} from 'hooks/useQueryState';
import {useSearchValues} from 'hooks/useSearchValues';
import {Order, OrderByParams} from 'models/pagination';
import SearchInput from 'components/SearchInput/index';
import {MenuBtn} from 'components/MenuBtn';
import AddIcon from '@mui/icons-material/Add';
import {MenuBtnProps} from 'models/misc';
import PageHeaderContainer from 'components/PageHeaderContainer';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import TableRow from 'components/Table/TableRow';
import Pagination from 'components/Pagination';
import {ACTION_CELL_WIDTH, TableColumnWithRender} from 'models/table';
import Cell from 'components/Table/TableCell';
import TableCellText from 'components/Table/TableCellText';
import {
  aggregateServiceOrderRow,
  createSearchQuery,
  getServiceOrderStatusColor,
  serviceOrderPaymentStatusToString,
  serviceOrderStatusToString,
  serviceOrderTypeToString,
} from 'utils/service-order-utils';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {Checkbox, FormControlLabel, TableBody, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {olStyles} from 'styles';
import {StatusChip} from 'components/StatusChip';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {NoteAltOutlined} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {theme} from 'theme';
import AvatarGroup from 'components/AvatarGroup';
import {formatDate} from 'utils/datetime';
import QuickFilter from 'components/QuickFilter';
import {OptionWithTranslationKey} from 'models/filter';
import Filters from 'components/Filters';
import ChipSelector from 'components/ChipSelector';
import CustomerInput from 'components/CustomerInput';
import TextInput from 'components/TextInput';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {PropertyOwnerView} from 'models/propertyManager';
import {useQueryCustomers} from 'hooks/reactQuery/useCustomers';
import EmptyTable from 'components/Table/EmptyTable';
import {
  useCompanyJobTypes,
  useOldCompanyJobTypes,
} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import JobNotesDrawer from 'pages/ServiceOrderDetails/JobNotesDrawer';
import TechnicianInput from 'components/TechnicianInput';
import {useGetTechniciansByEmployeeId} from 'hooks/reactQuery/useTechnician';
import {EmployeesView} from 'models/employee';

import Actions from './Actions';

const QUICK_FILTER_OPTIONS: OptionWithTranslationKey[] = [
  {value: ServiceOrderStatusFilter.ALL, labelKey: 'All'},
  {value: ServiceOrderStatusFilter.PENDING, labelKey: 'Pending'},
  {value: ServiceOrderStatusFilter.OVERDUE, labelKey: 'Overdue'},
  {value: ServiceOrderStatusFilter.ONGOING, labelKey: 'Ongoing'},
  {value: ServiceOrderStatusFilter.COMPLETED, labelKey: 'Completed'},
  {value: ServiceOrderStatusFilter.CANCELLED, labelKey: 'Cancelled'},
];

export const PAYMENT_STATUS_OPTIONS: OptionWithTranslationKey[] = [
  {
    value: ServiceOrderPaymentStatus.NO_INVOICE,
    labelKey: serviceOrderPaymentStatusToString(
      ServiceOrderPaymentStatus.NO_INVOICE,
    ),
  },
  {
    value: ServiceOrderPaymentStatus.NOT_PAID,
    labelKey: serviceOrderPaymentStatusToString(
      ServiceOrderPaymentStatus.NOT_PAID,
    ),
  },
  {
    value: ServiceOrderPaymentStatus.PARTIALLY_PAID,
    labelKey: serviceOrderPaymentStatusToString(
      ServiceOrderPaymentStatus.PARTIALLY_PAID,
    ),
  },
  {
    value: ServiceOrderPaymentStatus.OVERDUE,
    labelKey: serviceOrderPaymentStatusToString(
      ServiceOrderPaymentStatus.OVERDUE,
    ),
  },
  {
    value: ServiceOrderPaymentStatus.DONE,
    labelKey: serviceOrderPaymentStatusToString(ServiceOrderPaymentStatus.DONE),
  },
];

type Props = {
  menu: MenuBtnProps[];
};

export const ServiceOrderList = ({menu}: Props) => {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {user} = useUserSession();

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

  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, 25),
  });

  const totalOrederRef = useRef(0);
  const [searchQuery, setSearchQuery] = useQueryState('searchServiceOrders');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useQueryState<
    ServiceOrderPaymentStatus[]
  >('selectedPaymentStatus', {defaultValue: []});

  const [selectedOrderNumber, setSelectedOrderNumber] = useQueryState<
    string | undefined
  >('selectedOrderNumber', {defaultValue: undefined});
  const [selectedOrderStatus, setSelectedOrderStatus] = useQueryState<
    ServiceOrderStatusFilter | undefined
  >('selectedOrderStatusFilter', {
    defaultValue: undefined,
  });
  const [selectedOrderTypes, setSelectedOrderTypes] = useQueryState<
    ServiceOrderType[]
  >('selectedOrderTypes', {defaultValue: []});
  const [selectedCustomer, setSelectedCustomer] = useQueryState<
    string | undefined
  >('selectedCustomer', {defaultValue: undefined});

  const [selectedTechnicianId, setSelectedTechnicianId] = useQueryState<
    string | undefined
  >('selectedTechnicianId', {defaultValue: undefined});
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
  const [currentDate] = useState(new Date());

  const [hoverNoteServiceId, setHoverNoteServiceId] = useState<
    string | undefined
  >();

  const [initialLoadNoEntries, setInitialLoadNoEntries] = useState<
    boolean | undefined
  >();

  const [selectedServiceOrder, setSelectedServiceOrder] =
    useState<ServiceOrderView>();

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const {
    values: {sortOrder, orderByField},
    updateValues,
  } = useSearchValues<OrderByParams<ServiceOrderOrderField>>();

  const {data: selectedTechnician} =
    useGetTechniciansByEmployeeId(selectedTechnicianId);

  // filter intermediate state
  const {handleSubmit, getValues, setValue, watch, control} =
    useForm<ServiceOrderFilterForm>({
      defaultValues: {
        customer: selectedCustomer,
        technician: selectedTechnician,
        orderNumber: selectedOrderNumber,
        orderTypes: selectedOrderTypes ?? [],
        paymentStatus: selectedPaymentStatus ?? [],
        grossAmountMin,
        grossAmountMax,
        hasComment: isWithNote === 'true',
      },
      mode: 'all',
    });

  const watchOrderTypes = watch('orderTypes');
  const watchPaymentStatus = watch('paymentStatus');
  const watchHasComment = watch('hasComment');
  const watchGrossMin = watch('grossAmountMin');
  const watchGrossMax = watch('grossAmountMax');

  const {
    data: serviceOrdersResource = createEmptyResource<ServiceOrderView>(10),
    isLoading,
    isFetched,
    isIdle,
  } = useServiceOrders(
    {
      end: endOfDay(currentDate).toISOString(),
      start: startOfDay(subDays(currentDate, 30)).toISOString(),
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: createSearchQuery({
        search: searchQuery,
        orderNumber: selectedOrderNumber,
      }),
      status:
        selectedOrderStatus &&
        selectedOrderStatus !== ServiceOrderStatusFilter.ALL
          ? ServiceOrderFilterToStatusMap.get(selectedOrderStatus)
          : [],
      types: selectedOrderTypes,
      paymentStatus: selectedPaymentStatus,
      orderBy: orderByField || ServiceOrderOrderField.CREATED_TIME,
      order: sortOrder || Order.DESC,
      ...(grossAmountMin &&
        grossAmountMin > 0 && {grossAmountFrom: grossAmountMin}),
      ...(grossAmountMax &&
        grossAmountMax > 0 && {grossAmountTo: grossAmountMax}),
      ...(isWithNote === 'true' && {hasComments: true}),
      ...(selectedCustomer && {propertyOwnerId: selectedCustomer}),
      ...(selectedTechnicianId && {technicians: [selectedTechnicianId]}),
    },
    {keepPreviousData: true},
  );

  const {data: notes} = useServiceOrderComments(
    hoverNoteServiceId ?? '',
    {
      pageIndex: 0,
      pageSize: 1,
    },
    {
      enabled: !!hoverNoteServiceId,
    },
  );

  const fetchedNote = useMemo(() => {
    if (!hoverNoteServiceId) return undefined;
    return notes?.data[0];
  }, [hoverNoteServiceId, notes]);

  totalOrederRef.current =
    totalOrederRef.current || serviceOrdersResource.total;

  useEffect(() => {
    if (textInput.current && !textInput.current.value) {
      textInput.current.value = searchQuery;
    }
  }, []);

  useEffect(() => {
    if (
      serviceOrdersResource.total > 0 &&
      serviceOrdersResource.data.length === 0
    ) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
  }, [
    searchQuery,
    selectedOrderTypes,
    selectedOrderStatus,
    serviceOrdersResource,
    selectedPaymentStatus,
  ]);

  const rows = useMemo(
    () => aggregateServiceOrderRow(serviceOrdersResource.data),
    [serviceOrdersResource],
  );

  const totalPages = useMemo(
    () =>
      calculateTotalPages(
        serviceOrdersResource.total,
        serviceOrdersResource.page.pageSize,
      ),
    [serviceOrdersResource],
  );

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
  };

  const handleNoteHover = (serviceOrderId: string) => () => {
    setHoverNoteServiceId(serviceOrderId);
  };

  const handleNoteHoverClear = () => {
    setHoverNoteServiceId(undefined);
  };

  const handleFilterApply: SubmitHandler<ServiceOrderFilterForm> = (data) => {
    setSelectedCustomer(data.customer);
    setSelectedTechnicianId(data.technician?.id);
    setSelectedOrderNumber(data.orderNumber);
    setSelectedOrderTypes(data.orderTypes);
    setSelectedPaymentStatus(data.paymentStatus);
    setGrossAmountMin(data.grossAmountMin);
    setGrossAmountMax(data.grossAmountMax);
    setIsWithNote(data.hasComment ? 'true' : undefined);
  };

  const getAppliedFilter = useMemo(
    () =>
      [
        selectedCustomer,
        selectedTechnician,
        selectedOrderNumber,
        isWithNote,
      ].filter((field) => !!field).length +
      [grossAmountMin, grossAmountMax].filter((field) => !!field && field > 0)
        .length +
      [selectedPaymentStatus, selectedOrderTypes].filter(
        (field) => field.length > 0,
      ).length,
    [
      selectedOrderTypes,
      selectedOrderNumber,
      selectedPaymentStatus,
      selectedCustomer,
      selectedTechnician,
      grossAmountMin,
      grossAmountMax,
      isWithNote,
    ],
  );

  const COLUMNS = useMemo<TableColumnWithRender<ServiceOrderTableRow>[]>(
    () => [
      {
        headerName: 'Number',
        key: 'service-order-cell-number',
        fieldName: ServiceOrderOrderField.EXTERNAL_ID,
        width: '124px',
        isFirst: true, // remove when checkbox are present with bulk action
        showShadows: showRightShadow ? 'right' : undefined,
        renderCell: (serviceOrder, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{serviceOrder.number}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Job Type',
        key: 'service-order-cell-job-type',
        width: '156px',
        fieldName: ServiceOrderOrderField.JOB_TYPE,
        renderCell: (serviceOrder, cellProps) => (
          <Cell {...cellProps}>
            <ServiceOrderIcons
              serviceOrderType={serviceOrder.type}
              size="small"
            />
            <TableCellText tableCellTextStyles={{paddingLeft: '0.4em'}}>
              {serviceOrderTypeToString(serviceOrder.type) === '-'
                ? serviceOrder.type
                : t(serviceOrderTypeToString(serviceOrder.type))}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'ADDRESS',
        key: 'service-order-cell-address',
        fieldName: ServiceOrderOrderField.ELEVATOR_ADDRESS,
        renderCell: (serviceOrder, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
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
                      {serviceOrder.fullAddress
                        ? serviceOrder.fullAddress
                        : '-'}
                    </Typography>
                  </Box>
                }
                placement="top"
                arrow>
                {
                  (serviceOrder.address
                    ? serviceOrder.address
                    : '-') as unknown as ReactElement<ReactNode>
                }
              </Tooltip>
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Unit Number',
        key: 'service-order-cell-number-of-units',
        width: '124px',
        fieldName: ServiceOrderOrderField.ELEVATOR_EXTERNAL_ID,
        renderCell: (serviceOrder, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{serviceOrder.elevatorExternalId}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Due Date',
        key: 'service-order-cell-due-date',
        width: '112px',
        fieldName: ServiceOrderOrderField.DUE_DATE,
        renderCell: (serviceOrder, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{formatDate(serviceOrder.dueDate)}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Engineer',
        key: 'service-order-cell-engineer',
        width: '212px',
        fieldName: ServiceOrderOrderField.TECHNICIAN_NAME,
        renderCell: (serviceOrder, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              <AvatarGroup
                employees={serviceOrder.technicians.map(
                  (technician) => technician.userAccount,
                )}
              />
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Customer',
        key: 'service-order-cell-customer',
        width: '132px',
        fieldName: ServiceOrderOrderField.PROPERTY_OWNER_NAME,
        renderCell: (serviceOrder, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{serviceOrder.propertyOwner.name}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Job Status',
        key: 'service-order-cell-job-status',
        width: '142px',
        align: 'center',
        fieldName: ServiceOrderOrderField.JOB_STATUS,
        renderCell: (serviceOrder, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>
              <StatusChip
                color={getServiceOrderStatusColor(serviceOrder.jobStatus)}
                style={olStyles.orderStatus}
                label={serviceOrderStatusToString(serviceOrder.jobStatus)}
                variant="filled"
              />
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Payment',
        key: 'service-order-cell-payment',
        width: '132px',
        fieldName: ServiceOrderOrderField.PAYMENT_STATUS,
        renderCell: (serviceOrder, cellProps) => {
          const showIndicator = Object.values(
            ServiceOrderPaymentWithIndicationStatus,
          ).includes(
            serviceOrder.paymentStatus as unknown as ServiceOrderPaymentWithIndicationStatus,
          );

          return (
            <Cell {...cellProps}>
              <Box
                sx={{display: 'flex', alignItems: 'center', width: '100%'}}
                gap={0.5}>
                {showIndicator && (
                  <Tooltip
                    title={t(
                      `This job contains articles that haven’t been invoiced yet. Check the job details for more information.`,
                    )}
                    placement="top"
                    arrow>
                    <WarningAmberIcon
                      sx={{color: theme.palette.text.secondary}}
                    />
                  </Tooltip>
                )}
                <TableCellText
                  tableCellTextStyles={{
                    letterSpacing: '-0.15px',
                    lineHeight: '140%',
                  }}>
                  {t(
                    serviceOrderPaymentStatusToString(
                      serviceOrder.paymentStatus,
                    ),
                  )}
                </TableCellText>
              </Box>
            </Cell>
          );
        },
      },
      {
        headerName: 'NOTES',
        cellKey: 'service-order-cell-notes',
        width: '48px',
        align: 'center',
        renderCell: (serviceOrder, cellProps) => (
          <Cell
            {...cellProps}
            fieldName="NOTES"
            noWidthLimit
            onClick={() =>
              setSelectedServiceOrder(serviceOrder.serviceOrderData)
            }>
            <TableCellText>
              {serviceOrder.hasNotes ? (
                <Tooltip
                  onMouseEnter={handleNoteHover(serviceOrder.id)}
                  onMouseLeave={handleNoteHoverClear}
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
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'action',
        isHeaderNameHidden: true,
        align: 'center',
        width: ACTION_CELL_WIDTH, // set static width that will not change
        isLast: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        renderCell: (serviceOrder, cellProps) => (
          <Cell {...cellProps} onClick={undefined}>
            <Actions id={serviceOrder.id} />
          </Cell>
        ),
      },
    ],
    [fetchedNote, showLeftShadow, showRightShadow],
  );

  const handleSortField = (fieldName: string) => {
    const order = toggleOrder(
      orderByField === fieldName ? sortOrder : undefined,
    );
    updateValues({
      orderByField: order ? (fieldName as ServiceOrderOrderField) : undefined,
      sortOrder: order,
    });
  };

  const handleRowClick = (id: string) => () => {
    navigate(`/orders/details/${id}`);
  };

  const handleQuickFilterChange = (value: string | null) => {
    if (value === null) {
      setSelectedOrderStatus(undefined);
      return;
    }
    setSelectedOrderStatus(value as ServiceOrderStatusFilter);
  };

  const handleCloseSideDrawer = () => setSelectedServiceOrder(undefined);

  const handleSelectedOrderTypesChange = useCallback(
    (value: string) => {
      if (!watchOrderTypes.some((type) => type === value)) {
        setValue('orderTypes', [...watchOrderTypes, value as ServiceOrderType]);
      } else {
        setValue(
          'orderTypes',
          watchOrderTypes.filter((type) => type !== value),
        );
      }
    },
    [watchOrderTypes],
  );

  const handleSelectedPaymentStatusChange = useCallback(
    (value: string) => {
      if (!watchPaymentStatus.some((type) => type === value)) {
        setValue('paymentStatus', [
          ...watchPaymentStatus,
          value as ServiceOrderPaymentStatus,
        ]);
      } else {
        setValue(
          'paymentStatus',
          watchPaymentStatus.filter((type) => type !== value),
        );
      }
    },
    [watchPaymentStatus],
  );

  const handleWithNoteToggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setValue('hasComment', event.target.checked);
    },
    [setValue, watchHasComment],
  );

  const handleCustomerSelect = useCallback(
    (value?: string) => {
      setValue('customer', value);
    },
    [setValue],
  );

  const handleOrderNumberChange = useCallback(
    (value?: string) => {
      setValue('orderNumber', value);
    },
    [setValue],
  );

  const handleTechnicianChange = useCallback(
    (value?: EmployeesView) => {
      setValue('technician', value);
    },
    [setValue],
  );

  const handleGrossAmountMinChange = useCallback(
    (value?: string) => {
      const numberValue = Number(value);
      if (!Number.isNaN(numberValue)) setValue('grossAmountMin', numberValue);
    },
    [setValue],
  );

  const handleGrossAmountMaxChange = useCallback(
    (value?: string) => {
      const numberValue = Number(value);
      if (!Number.isNaN(numberValue)) setValue('grossAmountMax', numberValue);
    },
    [setValue],
  );

  // load customers for filter option before opening, issues with async autocomplete value on first render
  const {data: customers = createEmptyResource<PropertyOwnerView>(50)} =
    useQueryCustomers(
      {
        pageIndex: 0,
        pageSize: 50,
        query: '',
      },
      {keepPreviousData: true},
    );

  const handleFilterOpen = () => {
    setValue('customer', selectedCustomer);
    setValue('orderNumber', selectedOrderNumber);
    setValue('orderTypes', selectedOrderTypes ?? []);
    setValue('paymentStatus', selectedPaymentStatus ?? []);
    setValue('grossAmountMin', grossAmountMin);
    setValue('grossAmountMax', grossAmountMax);
    setValue('hasComment', isWithNote === 'true');
  };

  const handleFilterReset = () => {
    setValue('customer', undefined);
    setValue('technician', undefined);
    setValue('orderNumber', '');
    setValue('orderTypes', []);
    setValue('paymentStatus', []);
    setValue('grossAmountMin', undefined);
    setValue('grossAmountMax', undefined);
    setValue('hasComment', undefined);
  };

  const chipNumber = useMemo(() => {
    if (!selectedOrderStatus) return undefined;
    if (!isLoading && isFetched) return serviceOrdersResource.total;
  }, [isLoading, isFetched, serviceOrdersResource, selectedOrderStatus]);

  useEffect(() => {
    if (!isFetched) return;
    if (serviceOrdersResource.total === 0 && initialLoadNoEntries !== false) {
      setInitialLoadNoEntries(true);
    } else if (serviceOrdersResource.total > 0) {
      setInitialLoadNoEntries(false);
    }
  }, [
    initialLoadNoEntries,
    isFetched,
    serviceOrdersResource,
    setInitialLoadNoEntries,
  ]);

  useEffect(() => {
    setValue('technician', selectedTechnician);
  }, [selectedTechnician]);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (initialLoadNoEntries) {
    return (
      <EmptyTable
        illustration="jobs"
        label="No jobs"
        subLabel="Create a new job to start working and tracking its progress"
        btnLabel="New Job"
        actionButton={
          <MenuBtn
            startIcon={<AddIcon />}
            label="New Job"
            menu={menu}
            size="medium"
            color="primary"
            sx={{
              textTransform: 'inherit',
              ml: '0.8em',
              py: '0.7em',
              height: '40px',
            }}
            variant="contained"
            disableRipple
            disableFocusRipple
          />
        }
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
            defaultValue={searchQuery}
            onChange={(val: string) => setSearchQuery(val)}
          />
          <Filters
            activeFilters={getAppliedFilter}
            onOpen={handleFilterOpen}
            onSave={handleSubmit(handleFilterApply)}
            onReset={handleFilterReset}>
            <Box sx={{display: 'flex', flexDirection: 'column'}} gap={2}>
              <CustomerInput
                selectedValue={getValues('customer')}
                customers={customers.data}
                onChange={handleCustomerSelect}
              />
              <Controller
                control={control}
                name="technician"
                render={({field}) => (
                  <TechnicianInput
                    selectedTechnician={field.value}
                    onChange={handleTechnicianChange}
                  />
                )}
              />

              <Controller
                control={control}
                name="orderNumber"
                render={({field}) => (
                  <TextInput
                    {...field}
                    labelKey="Job number"
                    placeholder="Select job number"
                    onChange={handleOrderNumberChange}
                  />
                )}
              />
              <ChipSelector
                headerLabel="SERVICE TYPE"
                options={allJobTypes.map((jobType) => ({
                  value: jobType.name,
                  labelKey:
                    serviceOrderTypeToString(jobType.name) === '-'
                      ? jobType.name
                      : serviceOrderTypeToString(jobType.name),
                }))}
                selectedChips={watchOrderTypes}
                onChange={handleSelectedOrderTypesChange}
              />

              <ChipSelector
                headerLabel="Payment Status"
                options={PAYMENT_STATUS_OPTIONS}
                selectedChips={watchPaymentStatus}
                onChange={handleSelectedPaymentStatusChange}
              />
              <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
                <Typography variant="subtitle2">{t('Gross amount')}</Typography>

                <Box sx={{display: 'flex'}} gap={1}>
                  <Controller
                    control={control}
                    name="grossAmountMin"
                    render={() => (
                      <TextInput
                        value={watchGrossMin ? `${watchGrossMin}` : ''}
                        placeholder="Min"
                        styles={{
                          '& .MuiInputBase-input': {
                            textAlign: 'end',
                          },
                        }}
                        onChange={handleGrossAmountMinChange}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="grossAmountMax"
                    render={() => (
                      <TextInput
                        value={watchGrossMax ? `${watchGrossMax}` : ''}
                        placeholder="Max"
                        styles={{
                          '& .MuiInputBase-input': {
                            textAlign: 'end',
                          },
                        }}
                        onChange={handleGrossAmountMaxChange}
                      />
                    )}
                  />
                </Box>
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
                <Typography variant="subtitle2">{t('Notes')}</Typography>
                <FormControlLabel
                  label={t('Invoices with a note')}
                  control={
                    <Checkbox
                      checked={watchHasComment}
                      onChange={handleWithNoteToggle}
                    />
                  }
                />
              </Box>
            </Box>
          </Filters>
        </Box>

        <MenuBtn
          startIcon={<AddIcon />}
          label="New Job"
          menu={menu}
          size="medium"
          color="primary"
          sx={{
            textTransform: 'inherit',
            ml: '0.8em',
            py: '0.7em',
            height: '40px',
          }}
          variant="contained"
          disableRipple
          disableFocusRipple
        />
      </PageHeaderContainer>

      <Box>
        <QuickFilter
          selected={selectedOrderStatus ?? null}
          options={QUICK_FILTER_OPTIONS}
          chipNumber={chipNumber}
          onChange={handleQuickFilterChange}
        />
      </Box>

      <TableContainer
        setShowLeftShadow={setShowLeftShadow}
        setShowRightShadow={setShowRightShadow}>
        <TableHeader
          columns={COLUMNS}
          sortState={{columnName: orderByField, order: sortOrder}}
          onSort={handleSortField}
        />
        <TableBody>
          {/* Row */}
          {rows.map((entry) => (
            <TableRow
              key={`service-order-row-${entry.id}`}
              testId={`service-order-row-${entry.id}`}>
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
        currentIndex={serviceOrdersResource.page.pageIndex}
        numberOfElementsPerPage={serviceOrdersResource.page.pageSize}
        totalEntries={serviceOrdersResource.total}
        totalPages={totalPages}
        onChange={handlePageIndexChange}
        onNumberPerPageChange={handleChangeElementsPerPage}
      />

      {selectedServiceOrder && (
        <JobNotesDrawer
          open
          setOpen={handleCloseSideDrawer}
          serviceOrder={selectedServiceOrder}
        />
      )}
    </Box>
  );
};
