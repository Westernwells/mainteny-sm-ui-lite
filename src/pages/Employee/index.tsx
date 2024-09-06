import React, {useEffect, useMemo, useRef} from 'react';
import {endOfDay, startOfDay} from 'date-fns';
import * as _ from 'lodash';
import {EmptySection} from 'components/EmptySection';
import {Progress} from 'components/Progress';
import {useQueryTechnicianEvents} from 'hooks/reactQuery/useTechnician';
import {useQueryUserAccounts} from 'hooks/reactQuery/useUserAccount';
import {useQueryState} from 'hooks/useQueryState';
import {UserView} from 'models/user';
import {TechnicianEventPair, TechnicianEventType} from 'models/technician';
import {calculateTotalPages, createEmptyResource, makePage} from 'utils/paging';
import {toRestDateTime} from 'utils/datetime';
import {getRoles} from 'utils/work-hours-utils';
import {useNavigate} from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import {useTranslation} from 'react-i18next';
import {aggregateEmployeeRows} from '../../utils/employee';
import TableContainer from '../../components/Table/TableContainer';
import PageContainer from '../../components/PageContainer';
import SearchInput from '../../components/SearchInput/index';
import {ELEMENTS_PER_PAGE_OPTIONS} from '../../models/pagination';
import Pagination from '../../components/Pagination';
import {ACTION_CELL_WIDTH, TableColumnWithRender} from '../../models/table';
import TableHeader from '../../components/Table/TableHeader';
import AddButton from '../../components/AddButton';
import {EmployeeContractTableRow} from '../../models/employee';
import Cell from '../../components/Table/TableCell';
import TableRow from '../../components/Table/TableRow';
import {getAvailabilityChipColor} from '../../utils/availability';
import {StatusChip} from '../../components/StatusChip';
import {Actions} from './Actions';
import {capitalize} from '../../utils/utils';
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

  const COLUMNS = useRef<TableColumnWithRender<EmployeeContractTableRow>[]>([
    {
      headerName: 'Employee',
      width: '15%',
      renderCell: (employee, cellProps) => (
        <Cell isFirst width="15%" onClick={cellProps.onClick}>
          <Avatar src={employee.photoUrl} sx={{width: 24, height: 24}} />
          <TableCellText>{employee.name}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'ROLE',
      width: '10%',
      renderCell: (employee, cellProps) => (
        <Cell width="10%" onClick={cellProps.onClick}>
          <TableCellText capitalize>
            {t(capitalize(employee.roles))}
          </TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'ADDRESS',
      width: '20%',
      renderCell: (employee, cellProps) => (
        <Cell width="20%" onClick={cellProps.onClick}>
          <TableCellText>{employee.address}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'Team',
      width: '80px',
      align: 'right',
      renderCell: (employee, cellProps) => (
        <Cell align="right" width="80px" onClick={cellProps.onClick}>
          <TableCellText>{employee.team}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'PHONE',
      width: '10%',
      renderCell: (employee, cellProps) => (
        <Cell width="10%" onClick={cellProps.onClick}>
          <TableCellText>{employee.phone}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'SHIFT',
      width: '10%',
      renderCell: (employee, cellProps) => (
        <Cell isFirst width="10%" onClick={cellProps.onClick}>
          <TableCellText>{employee.shift}</TableCellText>
        </Cell>
      ),
    },
    {
      headerName: 'AVAILABILITY',
      width: 'auto',
      renderCell: (employee, cellProps) => (
        <Cell align="center" width="auto" onClick={cellProps.onClick}>
          <StatusChip
            label={employee.availability}
            {...getAvailabilityChipColor(employee.availability)}
          />
        </Cell>
      ),
    },
    {
      headerName: 'action',
      isHeaderNameHidden: true,
      width: ACTION_CELL_WIDTH, // set static width that will not change
      isLast: true,
      renderCell: (employee) => (
        <Cell isLast width={ACTION_CELL_WIDTH}>
          <Actions id={employee.employeeId} email={employee.email} />
        </Cell>
      ),
    },
  ]);

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
    const eventByTechnicianId = _.groupBy(
      technicianEvents?.data,
      (event: TechnicianEventPair) => event.technicianId,
    );
    return aggregateEmployeeRows(userAccountResource.data, eventByTechnicianId);
  }, [userAccountResource, isLoading]);

  const totalPages = useMemo(
    () =>
      calculateTotalPages(
        userAccountResource.total,
        userAccountResource.page.pageSize,
      ),
    [userAccountResource],
  );

  const handlePageIndexChange = (value: number) => {
    setPage({...page, pageIndex: value});
  };

  if (isFetched && !totalEmployeeRef.current) {
    return (
      <EmptySection
        label="No employees yet. Please click the button below to add."
        showActionBtn
        btnLabel="Add Employee"
        containerStyle={{
          height: '100%',
          mb: '10em',
        }}
      />
    );
  }

  if (isIdle || isLoading) {
    return <Progress />;
  }

  // const handleRoleChange = (value: string[]) => {
  // 	setRole(value[0] as Role);
  // };

  const handleNewEmployeeClick = () => {
    navigate('/employees/new');
  };

  const handleEmployeeClick = (id: string) => () => {
    navigate(`/employees/details/${id}`);
  };

  const handleChangeElementsPerPage = (value: number) => {
    setPage({...page, pageSize: value, pageIndex: 0});
  };

  return (
    <PageContainer gap={3}>
      <PageHeaderContainer>
        <SearchInput
          onChanged={(val: string) => setSearch(val)}
          refInput={textInput}
          defaultValue={search}
        />

        <AddButton label="New Employee" onClick={handleNewEmployeeClick} />
      </PageHeaderContainer>
      <TableContainer>
        <TableHeader columns={COLUMNS.current} />
        {/* Row */}
        {rows.map((entry) => (
          <TableRow
            key={`employee-row-${entry.id}`}
            testId="employee-row-container">
            {COLUMNS.current.map((column) =>
              column.renderCell(entry, {
                onClick: handleEmployeeClick(entry.id),
              }),
            )}
          </TableRow>
        ))}
      </TableContainer>
      <Pagination
        currentIndex={userAccountResource.page.pageIndex}
        numberOfElementsPerPage={userAccountResource.page.pageSize}
        totalEntries={userAccountResource.total}
        totalPages={totalPages}
        onChange={handlePageIndexChange}
        onNumberPerPageChange={handleChangeElementsPerPage}
      />
    </PageContainer>
  );
};

export default Employees;
