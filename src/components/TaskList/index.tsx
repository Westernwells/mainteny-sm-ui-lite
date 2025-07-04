import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {createEmptyResource, makePage, toggleOrder} from 'utils/paging';
import {Progress} from 'components/Progress';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {useSearchValues} from 'hooks/useSearchValues';
import EmptyTable from 'components/Table/EmptyTable';
import {SubmitHandler, useForm} from 'react-hook-form';
import {
  ACTION_CELL_WIDTH,
  DESCRIPTION_CELL_WIDTH,
  TableColumnWithRender,
} from 'models/table';
import Cell from 'components/Table/TableCell';
import TableCellText from 'components/Table/TableCellText';
import {Avatar} from 'components/Avatar';
import {theme} from 'theme';
import {StatusChip} from 'components/StatusChip';
import {Order, OrderByParams} from 'models/pagination';
import {useTranslation} from 'react-i18next';
import PageHeaderContainer from 'components/PageHeaderContainer';
import Box from '@mui/material/Box';
import SearchInput from 'components/SearchInput/index';
import DatePickerRange from 'components/DatePickerRange';
import Filters from 'components/Filters';
import {CircularProgress, SxProps, Tooltip, Typography} from '@mui/material';
import {Button} from 'components/Button';
import QuickFilter from 'components/QuickFilter';
import TableContainer from 'components/Table/TableContainer';
import TableHeader from 'components/Table/TableHeader';
import TableBody from 'components/Table/TableBody';
import TableRow from 'components/Table/TableRow';
import Pagination from 'components/Pagination';
import {OptionWithTranslationKey} from 'models/filter';
import {createQuickFilterOptions} from 'utils/filter';
import {DateRange} from '@mui/x-date-pickers-pro';
import {useExportTableSheet} from 'hooks/useExport';
import {convertUserAccountSimpleViewToAvatar} from 'utils/account-utils';
import {
  QueryTasksParams,
  TaskAssignmentType,
  TaskFilterForm,
  TaskFormRefEntity,
  TaskOrderField,
  TaskQuickFilter,
  TaskRefEntityType,
  TaskStatus,
  TaskTableRow,
  TaskView,
} from 'models/tasks';
import {
  aggregateTaskRow,
  getTaskStatusStyles,
  quickFilterToAssignedEmployeeId,
  quickFilterToAssignmentType,
} from 'utils/tasks';
import {NoteAlt, NoteAltOutlined} from '@mui/icons-material';
import {getUserFullName} from 'utils/utils';
import TagCell from 'components/Tag/TagCell';
import {TagEntityType} from 'models/tag';
import {
  useAllQueryTasks,
  useQueryTasks,
  useTasksStatistics,
} from 'hooks/reactQuery/useTasks';
import {stripHtmlTags} from 'utils/text-block';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useGetUserAccount} from 'hooks/reactQuery/useUserAccount';
import AddButton from 'components/AddButton';
import {useNavigate} from 'react-router';
import Actions from './Actions';
import FilterForm from './FilterForm';
import TaskDetailsDrawer from './TaskDetailsDrawer';
import TaskFormDrawer from './TaskFormDrawer';
import TaskAssignedToCell from './TaskAssignedToCell';

const pageSize = 25;

const QUICK_FILTER_OPTIONS: OptionWithTranslationKey[] =
  createQuickFilterOptions(TaskQuickFilter);

type Props = {
  quickFilterContainerSx?: SxProps;
  paginationSx?: SxProps;
  refEntity?: TaskFormRefEntity;
};

export const TaskList = ({
  quickFilterContainerSx,
  paginationSx,
  refEntity: fixedRefEntity,
}: Props) => {
  const {t} = useTranslation();
  const formatDate = useFormatDate();
  const [search, setSearch] = useQueryState('searchTasks');
  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const [selectedTaskId, setSelectedTaskId] = useQueryState<string | undefined>(
    'taskId',
  );
  const navigate = useNavigate();
  const [mode, setMode] = useQueryState<string | undefined>('mode');
  const user = useUserSession();
  const {data: userAccount} = useGetUserAccount(user?.user?.userAccount.id!);

  const [selectedQuickFilter, setSelectedQuickFilter] =
    useQueryState<TaskQuickFilter>('selectedQuickFilter', {
      defaultValue: undefined,
    });

  const [selectedStatus, setSelectedStatus] = useQueryState<TaskStatus[]>(
    'selectedStatus',
    {
      defaultValue: [],
    },
  );

  const [selectedTagNames, setSelectedTagNames] = useQueryState<string[]>(
    'selectedTagName',
    {
      defaultValue: [],
    },
  );

  const [selectedEmployeeId, setSelectedEmployeeId] = useQueryState<
    string | undefined
  >('assignedEmployeeId', {
    defaultValue: undefined,
  });

  const [selectedAssignmentType, setSelectedAssignmentType] = useQueryState<
    TaskAssignmentType | undefined
  >('assignmentType', {
    defaultValue: undefined,
  });

  const [selectedDueStartDate, setSelectedDueStartDate] = useQueryState<
    Date | undefined
  >('selectedDueStartDate', {
    defaultValue: undefined,
  });

  const [selectedDueEndDate, setSelectedDueEndDate] = useQueryState<
    Date | undefined
  >('selectedDueEndDate', {
    defaultValue: undefined,
  });

  const [selectedRefEntityId, setSelectedRefEntityId] = useQueryState<
    string | undefined
  >('selectedRefEntityId', {
    defaultValue: undefined,
  });

  const [selectedRefEntityType, setSelectedRefEntityType] = useQueryState<
    TaskRefEntityType | undefined
  >('selectedRefEntityType', {
    defaultValue: undefined,
  });

  const [selectedStartDate, setSelectedStartDate] = useQueryState<
    Date | undefined
  >('selectedStartDate', {
    defaultValue: undefined,
  });

  const [selectedEndDate, setSelectedEndDate] = useQueryState<Date | undefined>(
    'selectedEndDate',
    {
      defaultValue: undefined,
    },
  );

  const generateFormInitialValue = () => {
    let refEntity =
      selectedRefEntityId || selectedRefEntityType
        ? {
            refType: selectedRefEntityType,
            refId: selectedRefEntityId,
          }
        : undefined;

    if (fixedRefEntity) {
      refEntity = {
        refType: fixedRefEntity.refType,
        refId: fixedRefEntity.refId,
      };
    }

    return {
      status: selectedStatus ?? [],
      tagName: selectedTagNames,
      assignedEmployeeId: selectedEmployeeId,
      refEntity,
    };
  };

  const {handleSubmit, watch, control, setValue} = useForm<TaskFilterForm>({
    defaultValues: generateFormInitialValue(),
    mode: 'all',
  });

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const textInput = useRef<HTMLInputElement>(null);

  const [tempDateRange, setTempDateRange] = useState<DateRange<Date>>([
    selectedStartDate || null,
    selectedEndDate || null,
  ]);

  const {
    values: {sortOrder, orderByField},
    updateValues,
  } = useSearchValues<OrderByParams<TaskOrderField>>();

  const normalizeDateFilter = () => {
    const query: QueryTasksParams = {};

    if (selectedStartDate) {
      query.dueDateStart = formatDate(selectedStartDate, 'yyyy-MM-dd');
    }

    if (selectedEndDate) {
      query.dueDateEnd = formatDate(selectedEndDate, 'yyyy-MM-dd');
    }

    if (selectedDueStartDate) {
      query.dueDateStart = formatDate(selectedDueStartDate, 'yyyy-MM-dd');
    }

    if (selectedDueEndDate) {
      query.dueDateEnd = formatDate(selectedDueEndDate, 'yyyy-MM-dd');
    }

    return query;
  };

  const filters: QueryTasksParams = {
    ...(selectedStatus.length && {
      status: selectedStatus,
    }),
    ...(selectedTagNames.length && {
      tagName: selectedTagNames,
    }),
    ...(!!selectedAssignmentType && {
      assignmentType: selectedAssignmentType,
    }),
    ...(!!selectedEmployeeId && {
      assignedEmployeeId: selectedEmployeeId,
    }),

    refEntityId: fixedRefEntity ? fixedRefEntity.refId : selectedRefEntityId,
    refEntityType: fixedRefEntity
      ? fixedRefEntity.refType
      : selectedRefEntityType,
    ...normalizeDateFilter(),
  };

  const query: QueryTasksParams = {
    pageIndex: page.pageIndex || 0,
    pageSize: page.pageSize || 25,
    query: search,
    order: sortOrder || Order.DESC,
    orderBy: orderByField || TaskOrderField.CREATED_AT,
    assignmentType: quickFilterToAssignmentType(selectedQuickFilter),
    assignedEmployeeId: quickFilterToAssignedEmployeeId(
      selectedQuickFilter,
      userAccount,
    ),
    ...filters,
  };

  const {
    data: taskResource = createEmptyResource<TaskView>(10),
    isLoading,
    isFetched,
    isIdle,
  } = useQueryTasks(query, {keepPreviousData: true});

  const {data: myTaskResource = createEmptyResource<TaskView>(10)} =
    useQueryTasks(
      {
        ...query,
        assignedEmployeeId: userAccount?.userData.employeeId,
        assignmentType: TaskAssignmentType.SINGLE,
        pageIndex: 0,
        pageSize: 1,
      },
      {keepPreviousData: true, enabled: !!userAccount?.userData.employeeId},
    );

  const {refetch: refetchAllTasks, isFetching: isFetchingAllTasks} =
    useAllQueryTasks(query, {
      enabled: false,
      refetchOnWindowFocus: false,
    });

  const {data: tasksStatistics} = useTasksStatistics(query, {
    keepPreviousData: true,
  });

  const goToEmployeeDetails = (id?: string) => {
    if (!id) return;

    navigate(`/employees/details/${id}`);
  };

  const COLUMNS = useMemo<TableColumnWithRender<TaskTableRow>[]>(
    () => [
      {
        headerName: 'Task name',
        key: 'task-cell-name',
        width: '212px',
        fieldName: TaskOrderField.NAME,
        showShadows: showRightShadow ? 'right' : undefined,
        getExportValue: (task) => task.name || '',
        renderCell: (task, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{task.name}</TableCellText>
          </Cell>
        ),
        isFirst: true,
      },
      {
        headerName: 'Status',
        key: 'task-cell-status',
        width: '110px',
        align: 'center',
        fieldName: TaskOrderField.STATUS,
        getExportValue: (task) => t(getTaskStatusStyles(task.status).label),
        renderCell: (task, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText component="div">
              <StatusChip
                label={getTaskStatusStyles(task.status).label}
                color={getTaskStatusStyles(task.status).color}
                variant="filled"
                size="small"
                maxChars={9}
                style={task.status === TaskStatus.TO_DO ? {color: 'black'} : {}}
              />
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Due date',
        key: 'task-cell-date',
        width: '132px',
        align: 'right',
        fieldName: TaskOrderField.OVERDUE,
        getExportValue: (task) =>
          task.dueDate ? formatDate(task.dueDate)! : '',
        renderCell: (task, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{formatDate(task.dueDate)}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Description',
        key: 'task-cell-description',
        width: DESCRIPTION_CELL_WIDTH,
        getExportValue: (task) => stripHtmlTags(task.description),
        align: 'center',
        renderCell: (task, cellProps) => (
          <Cell {...cellProps} fieldName="Description" noWidthLimit>
            <TableCellText>
              {task.description ? (
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
                        {stripHtmlTags(task.description)}
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
        headerName: 'Assigned to',
        key: 'task-cell-assigned-to',
        width: '212px',
        fieldName: TaskOrderField.ASSIGNEE_LAST_NAME,

        showShadows: showRightShadow ? 'right' : undefined,
        getExportValue: (task) =>
          getUserFullName(task.assignedEmployee?.userAccount) || '',
        renderCell: (task, cellProps) => {
          const {assignedEmployee} = task;
          const {userAccount: assignedEmployeeAccount} = assignedEmployee ?? {};

          return (
            <Cell
              {...cellProps}
              onClick={() => {
                if (assignedEmployeeAccount?.id)
                  goToEmployeeDetails(assignedEmployeeAccount?.id);
              }}>
              <TaskAssignedToCell task={task} />
            </Cell>
          );
        },
      },
      {
        headerName: 'Tag(s)',
        key: 'article-cell-tag',
        width: '212px',
        getExportValue: (task) =>
          task.tags?.map((item) => item.name).join(', '),
        renderCell: (task, cellProps) => (
          <Cell {...cellProps}>
            <TagCell tags={task.tags || []} entity={TagEntityType.TASK} />
          </Cell>
        ),
      },
      {
        headerName: 'Author',
        key: 'task-cell-author-to',
        width: '212px',
        fieldName: TaskOrderField.CREATOR_LAST_NAME,
        showShadows: showRightShadow ? 'right' : undefined,
        getExportValue: (task) => getUserFullName(task.creator) || '',
        renderCell: (task, cellProps) => (
          <Cell {...cellProps}>
            {task.creator ? (
              <Avatar
                key={`task-creator-avatar-${task.creator?.id}`}
                userAccount={convertUserAccountSimpleViewToAvatar(task.creator)}
              />
            ) : (
              <TableCellText>-</TableCellText>
            )}
          </Cell>
        ),
      },
      {
        headerName: 'action',
        key: 'task-cell-action',
        isHeaderNameHidden: true,
        align: 'center',
        width: ACTION_CELL_WIDTH, // set static width that will not change
        isLast: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        noPadding: true,
        renderCell: (task, cellProps) => (
          <Cell {...cellProps} onClick={undefined}>
            <Actions
              setMode={setMode}
              setTaskId={setSelectedTaskId}
              task={task.data}
            />
          </Cell>
        ),
      },
    ],
    [showLeftShadow, showRightShadow],
  );

  const rows = useMemo(
    () => aggregateTaskRow(taskResource.data),
    [taskResource],
  );

  const handleFilterApply: SubmitHandler<TaskFilterForm> = (data) => {
    setSelectedStatus(data.status);
    setSelectedTagNames(data.tagName);
    setSelectedEmployeeId(data.assignedEmployeeId);
    setSelectedAssignmentType(data.assignmentType);
    setSelectedDueStartDate(data.dueDateStart);
    setSelectedDueEndDate(data.dueDateEnd);
    setSelectedRefEntityId(data.refEntity?.refId);
    setSelectedRefEntityType(data.refEntity?.refType);
  };

  const handleFilterOpen = () => {
    setValue('status', selectedStatus);
    setValue('assignedEmployeeId', selectedEmployeeId);
    setValue('dueDateStart', selectedDueStartDate);
    setValue('dueDateEnd', selectedDueEndDate);
    setValue('refEntity', {
      refType: selectedRefEntityType,
      refId: selectedRefEntityId,
    });
  };

  const handleFilterReset = () => {
    setSelectedStatus([]);
    setValue('status', []);

    setSelectedTagNames([]);
    setValue('tagName', []);

    setSelectedEmployeeId(undefined);
    setValue('assignedEmployeeId', undefined);

    setSelectedAssignmentType(undefined);
    setValue('assignmentType', undefined);

    setSelectedDueStartDate(undefined);
    setValue('dueDateStart', undefined);

    setSelectedDueEndDate(undefined);
    setValue('dueDateEnd', undefined);

    setSelectedRefEntityId(undefined);
    setSelectedRefEntityType(undefined);
    setValue('refEntity', undefined);
  };

  const appliedFilterNumber = useMemo(
    () =>
      // string
      [
        selectedEmployeeId,
        selectedAssignmentType,
        selectedDueStartDate,
        selectedDueEndDate,
        selectedRefEntityId,
      ].filter((field) => !!field).length +
      // array
      [selectedStatus, selectedTagNames].filter((field) => field.length > 0)
        .length,
    [
      selectedEmployeeId,
      selectedAssignmentType,
      selectedDueStartDate,
      selectedDueEndDate,
      selectedRefEntityId,
      selectedStatus,
      selectedTagNames,
    ],
  );

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleRowClick = (task: TaskView) => () => {
    setSelectedTaskId(task.id);
    setMode('view');
  };

  const handleSortField = (fieldName: string) => {
    const order = toggleOrder(
      orderByField === fieldName ? sortOrder : undefined,
    );
    updateValues({
      orderByField: order ? (fieldName as TaskOrderField) : undefined,
      sortOrder: order,
    });
  };

  const handleQuickFilterChange = (value: TaskQuickFilter) => {
    setSelectedQuickFilter(value);
  };

  const handleRangeChange = useCallback(() => {
    const startDate = tempDateRange?.[0] || undefined;
    const endDate = tempDateRange?.[1] || undefined;
    setSelectedStartDate(startDate);
    setSelectedEndDate(endDate || startDate);
  }, [tempDateRange]);

  const clearDateSelection = () => {
    setSelectedStartDate(undefined);
    setSelectedEndDate(undefined);
  };

  const handleExport = useExportTableSheet<TaskTableRow, TaskView>({
    excludedFields: ['task-cell-action'],
    refetchCallback: refetchAllTasks,
    columns: COLUMNS,
    aggregateCallback: (data) => aggregateTaskRow(data),
    fileName: 'Tasks',
  });

  const handleCreateDrawerClose = () => {
    setMode(undefined);
    setSelectedTaskId(undefined);
  };

  const handleNewTaskPress = () => {
    setMode('create');
    setSelectedTaskId(undefined);
  };

  const aggregatedTasksStatistics = useMemo(() => {
    if (!tasksStatistics) return undefined;

    const numOfTasksPerAssignmentType =
      tasksStatistics.numOfTasksPerAssignmentType ?? {};
    const everyone = Object.keys(numOfTasksPerAssignmentType).reduce(
      (acc, item) => acc + numOfTasksPerAssignmentType[item],
      0,
    );

    return {
      [TaskQuickFilter.ALL]: everyone,
      [TaskQuickFilter.My_TASKS]: myTaskResource?.total ?? 0,
      [TaskQuickFilter.OFFICE]: numOfTasksPerAssignmentType.OFFICE,
      [TaskQuickFilter.TECHNICIANS]: numOfTasksPerAssignmentType.TECHNICIANS,
    };
  }, [tasksStatistics, selectedQuickFilter, myTaskResource]);

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
        !!selectedQuickFilter ||
        selectedEndDate ||
        !!search) &&
      taskResource.total === 0
    ) {
      return {emptyTable: false, noMatchingData: true};
    }

    // when the user does not have filters applied and there are no entries for the table
    if (taskResource.total === 0) {
      return {emptyTable: true, noMatchingData: false};
    }

    return {emptyTable: false, noMatchingData: false};
  }, [appliedFilterNumber, isFetched, taskResource]);

  useEffect(() => {
    if (taskResource.total > 0 && taskResource.data.length === 0) {
      setPage({
        ...page,
        pageIndex: 0,
      });
    }
  }, [search, selectedStatus, taskResource]);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (emptyTable) {
    return (
      <>
        <EmptyTable
          illustration="tasks"
          label="No tasks"
          subLabel="Create and assign a new task, keep track and manage everything in one place"
          btnLabel="New Task"
          onClick={() => {
            setMode('create');
          }}
        />
        <TaskFormDrawer
          taskId={selectedTaskId}
          mode={mode}
          onClose={handleCreateDrawerClose}
          refEntity={fixedRefEntity}
        />
      </>
    );
  }

  return (
    <>
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
            inputTestId="start-end-date"
            popupTestId="start-end-date-popup"
          />
          <Filters
            filterButtonTestId="task-filter-open-button"
            filterDrawerMainTestId="task-filters-main"
            activeFilters={appliedFilterNumber}
            onOpen={handleFilterOpen}
            onSave={handleSubmit(handleFilterApply)}
            onReset={handleFilterReset}>
            <FilterForm watch={watch} setValue={setValue} control={control} />
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
                disabled: isFetchingAllTasks,
              }}
              style={{
                borderColor: 'text.primary',
                height: '36px',
                paddingTop: 0,
              }}>
              {isFetchingAllTasks ? (
                <CircularProgress size="1rem" sx={{mr: 1}} />
              ) : null}
              <Box pt={0.5}>{t('Export')}</Box>
            </Button>
          )}
          <AddButton label="New Task" onClick={handleNewTaskPress} />
        </Box>
      </PageHeaderContainer>
      <Box sx={quickFilterContainerSx}>
        <QuickFilter
          alwaysShowCount={false}
          selected={selectedQuickFilter ? [selectedQuickFilter] : []}
          options={QUICK_FILTER_OPTIONS}
          statistics={aggregatedTasksStatistics}
          onChange={(value: string) =>
            handleQuickFilterChange(value as TaskQuickFilter)
          }
          chipSx={{
            minWidth: '30px',
            marginLeft: '10px',
            marginRight: '5px',
            '& .MuiChip-label': {
              paddingLeft: '2px',
              paddingRight: '2px',
            },
          }}
        />
      </Box>
      <TableContainer
        showNoMatchWarning={noMatchingData}
        containerRef={containerRef}
        setShowLeftShadow={setShowLeftShadow}
        setShowRightShadow={setShowRightShadow}
        data-testid="task-list">
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
              key={`task-row-${entry.id}`}
              testId={`task-row-${entry.id}`}>
              {COLUMNS.map(({renderCell, ...rest}) =>
                renderCell(entry, {
                  onClick: handleRowClick(entry.task),
                  ...rest,
                }),
              )}
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
      <Pagination
        testId="task-pagination"
        sx={paginationSx}
        currentIndex={taskResource.page.pageIndex}
        numberOfElementsPerPage={taskResource.page.pageSize}
        totalEntries={taskResource.total}
        onChange={handlePageIndexChange}
        onNumberPerPageChange={handleChangeElementsPerPage}
      />
      <TaskDetailsDrawer
        open={mode === 'view' && !!selectedTaskId}
        taskId={selectedTaskId}
        setMode={setMode}
        setTaskId={setSelectedTaskId}
        onClose={() => {
          setSelectedTaskId(undefined);
          setMode(undefined);
        }}
      />
      <TaskFormDrawer
        taskId={selectedTaskId}
        mode={mode}
        onClose={handleCreateDrawerClose}
        refEntity={fixedRefEntity}
      />
    </>
  );
};

export default TaskList;
