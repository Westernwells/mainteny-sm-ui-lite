import React, {useEffect, useMemo, useRef, useState} from 'react';
import {endOfDay, startOfDay} from 'date-fns';
import {Progress} from 'components/Progress';
import {useQueryTechnicianEvents} from 'hooks/reactQuery/useTechnician';
import {useQueryUserAccounts} from 'hooks/reactQuery/useUserAccount';
import {useQueryState} from 'hooks/useQueryState';
import {UserView} from 'models/user';
import {TechnicianEventPair, TechnicianEventType} from 'models/technician';
import {createEmptyResource, makePage} from 'utils/paging';
import {toRestDateTime} from 'utils/datetime';
import {getRoles} from 'utils/work-hours-utils';
import {useNavigate} from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import {useTranslation} from 'react-i18next';
import TableBody from 'components/Table/TableBody';
import {aggregateEmployeeRows} from 'utils/employee';
import {ELEMENTS_PER_PAGE_OPTIONS} from 'models/pagination';
import {ACTION_CELL_WIDTH, TableColumnWithRender} from 'models/table';
import {EmployeeContractTableRow} from 'models/employee';
import {getAvailabilityChipColor} from 'utils/availability';
import {StatusChip} from 'components/StatusChip';
import {capitalize} from 'utils/utils';
import {groupBy} from 'lodash';
import EmptyTable from 'components/Table/EmptyTable';
import TableContainer from '../../components/Table/TableContainer';
import PageContainer from '../../components/PageContainer';
import SearchInput from '../../components/SearchInput/index';
import Pagination from '../../components/Pagination';
import TableHeader from '../../components/Table/TableHeader';
import AddButton from '../../components/AddButton';
import Cell from '../../components/Table/TableCell';
import TableRow from '../../components/Table/TableRow';
import {Actions} from './Actions';
import PageHeaderContainer from '../../components/PageHeaderContainer';
import TableCellText from '../../components/Table/TableCellText';

export const Employees = () => {
  const navigate = useNavigate();

  const [page, setPage] = useQueryState('employeePage', {
    defaultValue: makePage(0, ELEMENTS_PER_PAGE_OPTIONS[1]),
  });
  const totalEmployeeRef = useRef(0);
  const [search, setSearch] = useQueryState('searchEmployees');
  const textInput = useRef<HTMLInputElement>(null);
  const {t} = useTranslation();

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const COLUMNS = useMemo<TableColumnWithRender<EmployeeContractTableRow>[]>(
    () => [
      {
        headerName: 'Employee',
        key: 'employee-cell-employee',
        isFirst: true,
        showShadows: showRightShadow ? 'right' : undefined,
        renderCell: (employee, cellProps) => (
          <Cell {...cellProps}>
            <Avatar src={employee.photoUrl} sx={{width: 24, height: 24}} />
            <TableCellText>{employee.name}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'ROLE',
        key: 'employee-cell-role',
        width: '236px',
        renderCell: (employee, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText capitalize>
              {t(capitalize(employee.roles))}
            </TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'ADDRESS',
        key: 'employee-cell-address',
        renderCell: (employee, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{employee.address}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'Team',
        key: 'employee-cell-team',
        width: '80px',
        align: 'right',
        renderCell: (employee, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{employee.team}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'PHONE',
        key: 'employee-cell-phone',
        renderCell: (employee, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{employee.phone}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'SHIFT',
        key: 'employee-cell-shift',
        width: '112px',
        renderCell: (employee, cellProps) => (
          <Cell {...cellProps}>
            <TableCellText>{employee.shift}</TableCellText>
          </Cell>
        ),
      },
      {
        headerName: 'AVAILABILITY',
        key: 'employee-cell-availability',
        align: 'center',
        width: '136px',
        renderCell: (employee, cellProps) => (
          <Cell {...cellProps}>
            <StatusChip
              label={employee.availability}
              {...getAvailabilityChipColor(employee.availability)}
            />
          </Cell>
        ),
      },
      {
        headerName: 'action',
        key: 'employee-cell-action',
        isHeaderNameHidden: true,
        align: 'center',
        width: ACTION_CELL_WIDTH, // set static width that will not change
        isLast: true,
        noPadding: true,
        showShadows: showLeftShadow ? 'left' : undefined,
        renderCell: (employee, cellProps) => (
          <Cell {...cellProps} onClick={undefined}>
            <Actions id={employee.employeeId} email={employee.email} />
          </Cell>
        ),
      },
    ],
    [showLeftShadow, showRightShadow],
  );

  const {
    data: userAccountResource = createEmptyResource<UserView>(page.pageSize),
    isFetched,
    isIdle,
    isLoading,
    // isFetching,
  } = useQueryUserAccounts(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      roles: getRoles(''),
    },
    {keepPreviousData: true},
  );

  const {data: technicianEvents} = useQueryTechnicianEvents({
    start: toRestDateTime(startOfDay(new Date())),
    end: toRestDateTime(endOfDay(new Date())),
    pageIndex: 0,
    pageSize: 500,
    eventType: [TechnicianEventType.HOLIDAY, TechnicianEventType.SICK_LEAVE],
  });

  totalEmployeeRef.current =
    totalEmployeeRef.current || userAccountResource.total;

  useEffect(() => {
    if (
      userAccountResource.total > 0 &&
      userAccountResource.data.length === 0
    ) {
      setPage({...page, pageIndex: 0});
    }
    if (textInput.current) {
      textInput.current.value = search;
    }
  }, [search]);

  const rows = useMemo(() => {
    if (isLoading) return [];
    const eventByTechnicianId = groupBy(
      technicianEvents?.data,
      (event: TechnicianEventPair) => event.technicianId,
    );
    return aggregateEmployeeRows(userAccountResource.data, eventByTechnicianId);
  }, [userAccountResource, isLoading, technicianEvents]);

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleNewEmployeeClick = () => {
    navigate('/employees/new');
  };

  const handleEmployeeClick = (id: string) => () => {
    navigate(`/employees/details/${id}`);
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
    containerRef?.current?.scrollTo({top: 0, behavior: 'smooth'});
  };

  const {emptyTable, noMatchingData} = useMemo(() => {
    if (!isFetched) return {emptyTable: false, noMatchingData: false};

    if (search && userAccountResource.total === 0) {
      return {emptyTable: false, noMatchingData: true};
    }

    // when the user does not have filters applied and there are no entries for the table
    if (userAccountResource.total === 0) {
      return {emptyTable: true, noMatchingData: false};
    }

    return {emptyTable: false, noMatchingData: false};
  }, [isFetched, userAccountResource]);

  if (isIdle || isLoading) {
    return <Progress />;
  }

  if (emptyTable) {
    return (
      <EmptyTable
        label="No employees"
        subLabel="Add new employees and centralize all their information—work hours, absence tracking, contact details, and schedules—in one place to organize your work and enhance efficiency."
        btnLabel="Add Employee"
        illustration="employee"
        onClick={handleNewEmployeeClick}
      />
    );
  }

  return (
    <PageContainer gap={3}>
      <PageHeaderContainer>
        <SearchInput
          refInput={textInput}
          defaultValue={search}
          onChange={(val: string) => setSearch(val)}
        />

        <AddButton label="New Employee" onClick={handleNewEmployeeClick} />
      </PageHeaderContainer>
      <TableContainer
        containerRef={containerRef}
        showNoMatchWarning={noMatchingData}
        setShowLeftShadow={setShowLeftShadow}
        setShowRightShadow={setShowRightShadow}>
        <TableHeader columns={COLUMNS} />
        <TableBody>
          {/* Row */}
          {rows.map((entry, idx) => (
            <TableRow
              data-rowindex={idx}
              key={`employee-row-${entry.id}`}
              testId={`employee-row-${entry.id}`}>
              {COLUMNS.map(({renderCell, ...rest}) =>
                renderCell(entry, {
                  onClick: handleEmployeeClick(entry.id),
                  ...rest,
                }),
              )}
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
      <Pagination
        currentIndex={userAccountResource.page.pageIndex}
        numberOfElementsPerPage={userAccountResource.page.pageSize}
        totalEntries={userAccountResource.total}
        onChange={handlePageIndexChange}
        onNumberPerPageChange={handleChangeElementsPerPage}
      />
    </PageContainer>
  );
};

export default Employees;
