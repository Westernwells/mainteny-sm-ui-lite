import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {addDays, endOfDay, startOfDay} from 'date-fns';
import {GridRowsProp} from '@mui/x-data-grid';
import * as _ from 'lodash';

import {DataGridLayout} from 'components/DataGridLayout';
import {PageListingLayout} from 'components/PageListingLayout';
import {Widget} from 'components/Widget';
import {EmptySection} from 'components/EmptySection';
import {FilterFields} from 'components/FilterFields';
import {Progress} from 'components/Progress';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {useQueryTechnicianEvents} from 'hooks/reactQuery/useTechnician';
import {useQueryUserAccounts} from 'hooks/reactQuery/useUserAccount';
import {useQueryState} from 'hooks/useQueryState';
import {TechnicianEventType} from 'models/misc';
import {UserView, Role} from 'models/user';
import {TechnicianEventPair} from 'models/technician';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {toRestDateTime} from 'utils/datetime';
import {getRoles} from 'utils/work-hours-utils';
import {columns, makeRows} from './EmployeeDataGridProps';

const pageSize = 25;

export const Employees = () => {
  const navigate = useNavigate();

  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, pageSize),
  });
  const totalEmployeeRef = useRef(0);
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch, clearFilters] = useQueryState('searchEmployees');
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [role, setRole] = useQueryState<Role | string>('role');
  const textInput = useRef<HTMLInputElement>(null);

  const {
    data: userAccountResource = createEmptyResource<UserView>(pageSize),
    isFetched,
    isIdle,
    isLoading,
    isFetching,
  } = useQueryUserAccounts(
    {
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: search,
      roles: getRoles(role),
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
    if (
      userAccountResource.total > 0 &&
      userAccountResource.data.length === 0
    ) {
      setPage({...page, pageIndex: 0});
    }
    if (textInput.current) {
      textInput.current.value = search;
    }
  }, [search, role]);

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

  const handleRoleChange = (value: string[]) => {
    setRole(value[0] as Role);
  };

  const renderFilterItems = () => (
    <FilterFields
      containerStyle={{alignSelf: 'center', height: '100%'}}
      wrapperStyle={{alignItems: 'center'}}
      onClear={clearFilters}>
      <MultipleSelectCheckmarks
        label="Role"
        initialSelectedItems={role ? [role] : []}
        options={['Technician', 'Service Manager']}
        containerStyles={{
          minWidth: '21.875em',
          marginRight: '0.438em',
          alignItems: 'center',
        }}
        formControlStyles={{
          width: '100%',
        }}
        getSelectedValue={(item) => handleRoleChange(item)}
        multiple={false}
      />
    </FilterFields>
  );

  return (
    <PageListingLayout
      renderWidget={
        <Widget
          searchPlaceholder="Search by name, role, address etc."
          getSearchValue={(val: string) => setSearch(val)}
          showActionBtn
          btnOnClick={() => navigate('/employees/new')}
          btnLabel="New Employee"
          refInput={textInput}
          filterItems={renderFilterItems()}
          defaultSearchValue={search}
        />
      }>
      <DataGridLayout
        rows={rows}
        columns={columns}
        loading={isFetching}
        scrollToTop={search}
        pageSize={page.pageSize}
        pageIndex={page.pageIndex + 1}
        handlePageSizeChange={(newPageSize: number) =>
          setPage({
            ...page,
            pageSize: newPageSize,
          })
        }
        handlePageChange={(newPage: number) =>
          setPage({
            ...page,
            pageIndex: newPage - 1,
          })
        }
        pageCount={pageCount}
        totalRows={userAccountResource.total}
      />
    </PageListingLayout>
  );
};

export default Employees;
