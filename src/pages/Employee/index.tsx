import {DataGridLayout} from 'components/DataGridLayout';
import {PageListingLayout} from 'components/PageListingLayout';
import {Widget} from 'components/Widget';
import {useQueryTechnicianEvents} from 'hooks/reactQuery/useTechnician';
import {useQueryUserAccounts} from 'hooks/reactQuery/useUserAccount';
import {TechnicianEventType} from 'models/misc';
import {CommonUserView, Role} from 'models/user';
import {useEffect, useRef, useState} from 'react';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import * as _ from 'lodash';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {useSearchParams} from 'react-router-dom';
import {Progress} from 'components/Progress';
import {TechnicianEventPair} from 'models/technician';
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
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    data: userAccountResource = createEmptyResource<CommonUserView>(pageSize),
    isFetched,
    isIdle,
    isLoading,
    isFetching,
  } = useQueryUserAccounts(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      roles: [Role.SERVICE_MANAGER, Role.TECHNICIAN],
    },
    {keepPreviousData: true},
  );

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
    if (!isLoading) {
      const eventByTechnicianId = _.groupBy(
        technicianEvents?.data,
        (event: TechnicianEventPair) => event.technicianId,
      );
      setRows(makeRows(userAccountResource.data, eventByTechnicianId));
    }
  }, [userAccountResource, isLoading]);

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
    <PageListingLayout
      label="Employees"
      renderWidget={
        <Widget
          searchPlaceholder="Search name, role, address, phone"
          getSearchValue={(val: string) => setSearch(val)}
          showFilter
          showActionBtn
          btnLabel="New employee"
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
    </PageListingLayout>
  );
};
