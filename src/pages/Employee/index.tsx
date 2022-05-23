import {DataGridLayout} from 'components/DataGridLayout';
import {PageOverviewLayout} from 'components/PageOverviewLayout';
import {Widget} from 'components/Widget';
import {
  useFetchTechniciansByUserAccounts,
  useQueryTechnicianEvents,
} from 'hooks/reactQuery/useTechnician';
import {useQueryUserAccounts} from 'hooks/reactQuery/useUserAccount';
import {EmployeesView} from 'models/employee';
import {Resource, TechnicianEventType} from 'models/misc';
import {Role, UserAccountView} from 'models/user';
import {useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import * as _ from 'lodash';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {useSearchParams} from 'react-router-dom';
import {Progress} from 'components/Progress';
import {TechnicianEventPair, TechnicianView} from 'models/technician';
import {toRestDateTime} from 'utils/datetime';
import {addDays, endOfDay, startOfDay} from 'date-fns';
import {GridRowsProp} from '@mui/x-data-grid';
import {EmptySection} from 'components/EmptySection';
import {columns, makeRows} from './EmployeeDataGridProps';
import {AddEmployee} from './AddEmployee';

const pageSize = 25;

export const Employees = () => {
  const [page, setPage] = useState(makePage(0, pageSize));
  const [queryParams, setQueryParams] = useSearchParams();
  const totalEmployeeRef = useRef(0);
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [employeeResource, setEmployeeResource] = useState(
    createEmptyResource<EmployeesView>(pageSize),
  );

  const {
    data: userAccountResource = createEmptyResource<UserAccountView>(pageSize),
  } = useQueryUserAccounts(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      roles: [Role.SERVICE_MANAGER, Role.TECHNICIAN],
    },
    {keepPreviousData: true},
  );

  const {
    data: technicians = [],
    isLoading,
    isFetching,
    isIdle,
    isFetched,
  } = useFetchTechniciansByUserAccounts(userAccountResource.data, {
    keepPreviousData: true,
  });

  const {data: technicianEvents} = useQueryTechnicianEvents({
    start: toRestDateTime(startOfDay(addDays(new Date(), 1))),
    end: toRestDateTime(endOfDay(addDays(new Date(), 1))),
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    eventType: [TechnicianEventType.HOLIDAY, TechnicianEventType.SICK_LEAVE],
  });

  totalEmployeeRef.current =
    totalEmployeeRef.current || userAccountResource.total;

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);

    setPage({
      ...page,
      pageSize: Number(currentParams.pageSize),
      pageIndex: Number(currentParams.pageIndex) - 1,
    });
  }, [queryParams]);

  useEffect(() => {
    let userData: Resource<EmployeesView> = {
      total: userAccountResource.total,
      data: [],
      page: {
        pageIndex: userAccountResource.page.pageIndex,
        pageSize: userAccountResource.page.pageSize,
      },
    };

    const techniciansByUserAccountId = _.groupBy(
      technicians,
      (technician: TechnicianView) => technician.userAccount.id,
    );

    const eventByTechnicianId = _.groupBy(
      technicianEvents?.data,
      (event: TechnicianEventPair) => event.technicianId,
    );

    userAccountResource.data.forEach((item) => {
      if (techniciansByUserAccountId[item.id]) {
        const technician = techniciansByUserAccountId[item.id][0];
        userData = {
          ...userData,
          data: [
            ...userData.data,
            {
              ...technician,
              events:
                eventByTechnicianId[technician.id] &&
                eventByTechnicianId[technician.id][0].eventViews,
            },
          ],
        };
      } else {
        userData = {
          ...userData,
          data: [...userData.data, {userAccount: item}],
        };
      }
    });

    setEmployeeResource(userData);
  }, [technicians, userAccountResource]);

  useEffect(() => {
    setRows(makeRows(employeeResource.data));
  }, [employeeResource]);

  useEffect(() => {
    setPageCount(Math.ceil(userAccountResource.total / page.pageSize));
  }, [userAccountResource, page.pageSize]);

  if (isFetched && !totalEmployeeRef.current) {
    return (
      <EmptySection
        label="No employees have been created yet. Please click the button below to create one!"
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

  return (
    <PageOverviewLayout
      label="Employees"
      renderWidget={
        <Widget
          searchPlaceholder="Search name, role, address, phone"
          getSearchValue={(val: string) => setSearch(val)}
          setShowFilter={setShowFilter}
          showFilter={showFilter}
          btnLabel="New Employee"
          btnOnClick={() => setIsDrawerOpen(true)}
          showActionBtn
          hideFilter
          hideViewOption
        />
      }>
      <DataGridLayout
        rows={rows}
        columns={columns}
        loading={isFetching}
        hideFooter={pageCount <= 1}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setQueryParams(formatSearchParamsPageSize(newPageSize, queryParams))
        }
        handlePageChange={(newPage: number) =>
          setQueryParams(formatSearchParamsPageIndex(newPage, queryParams))
        }
        pageCount={pageCount}
        totalRows={userAccountResource.total}
      />

      <AddEmployee open={isDrawerOpen} setOpen={setIsDrawerOpen} />
    </PageOverviewLayout>
  );
};
