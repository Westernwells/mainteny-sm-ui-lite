import {useEffect, useMemo, useRef} from 'react';
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
import {Box} from '@mui/system';
import {useNavigate} from 'react-router-dom';
import EmployeeRow from './EmployeeRow';
import {aggregateEmployeeRows} from '../../utils/employee';
import TableContainer from '../../components/Table/TableContainer';
import PageContainer from '../../components/PageContainer';
import SearchInput from '../../components/SearchInput/index';
// import {Option} from '../../models/filter';
// import {AVAILABILITY_TYPE_TO_TRANSLATION_KEY} from '../../models/availability';
import {ELEMENTS_PER_PAGE_OPTIONS} from '../../models/pagination';
import Pagination from '../../components/Pagination';
import {TableColumn} from '../../models/table';
import TableHeader from '../../components/Table/TableHeader';
import AddButton from '../../components/AddButton';
import TableBody from '../../components/Table/TableBody';

// const FILTER_OPTIONS: Option[] = [
// 	{value: null, labelKey: 'All'},
// 	...Array.from(AVAILABILITY_TYPE_TO_TRANSLATION_KEY.entries()).map(
// 		([value, labelKey]) => ({
// 			labelKey,
// 			value,
// 		}),
// 	),
// ];

const COLUMNS: TableColumn[] = [
  {
    headerName: 'select',
    isHeaderNameHidden: true,
    width: '3%',
    isFirst: true,
    hide: true,
  },
  {
    headerName: 'Employee',
    width: '15%',
    isFirst: true, // remove when checkbox are present with bulk action
  },
  {
    headerName: 'ROLE',
    width: '10%',
  },
  {
    headerName: 'ADDRESS',
    width: '20%',
  },
  {
    headerName: 'Team',
    width: '5%',
    align: 'right',
  },
  {
    headerName: 'PHONE',
    width: '10%',
  },
  {
    headerName: 'SHIFT',
    width: '10%',
  },
  {
    headerName: 'AVAILABILITY',
    width: '10%',
  },
  {
    headerName: 'action',
    isHeaderNameHidden: true,
    width: '3%',
    isLast: true,
  },
];

export const Employees = () => {
  const navigate = useNavigate();

  const [page, setPage] = useQueryState('employeePage', {
    defaultValue: makePage(0, ELEMENTS_PER_PAGE_OPTIONS[1]),
  });
  const totalEmployeeRef = useRef(0);
  const [search, setSearch] = useQueryState('searchEmployees');
  // const [role, setRole] = useQueryState<Role | string>('role');
  // const [availabilityType, setAvailabilityType] =
  // 	useState<AvailabilityType | null>(null);
  const textInput = useRef<HTMLInputElement>(null);

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

  // const handleSortChange = (fieldName: string) => {
  //   const sorting = values.sortOrder === Order.ASC ? Order.DESC : Order.ASC;
  //   updateValues({
  //     ...values,
  //     orderByField: fieldName,
  //     sortOrder: sorting,
  //   });
  // };

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

  // const handleAvailabilityChange = (value: string | null) => {
  // 	if (value === null) setAvailabilityType(null);
  // 	else {
  // 		// setAvailabilityType(value as AvailabilityType);
  // 	}
  // };

  return (
    <PageContainer gap={4}>
      <Box gap={4} sx={{display: 'flex', flexDirection: 'column'}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <SearchInput
            onChanged={(val: string) => setSearch(val)}
            refInput={textInput}
            defaultValue={search}
          />

          <AddButton label="New Employee" onClick={handleNewEmployeeClick} />
        </Box>
        <Box sx={{display: 'flex'}}>
          {/* <QuickFilter */}
          {/*	selected={availabilityType} */}
          {/*	options={FILTER_OPTIONS} */}
          {/*	onChange={handleAvailabilityChange} */}
          {/* /> */}
        </Box>
      </Box>
      <TableContainer>
        <TableHeader columns={COLUMNS} />
        <TableBody>
          {/* Row */}
          {rows.map((entry) => (
            <EmployeeRow
              employeeDetails={entry}
              columns={COLUMNS}
              onClick={handleEmployeeClick(entry.id)}
            />
          ))}
        </TableBody>
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
