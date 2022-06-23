import {useEffect, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {addDays, endOfDay, startOfDay} from 'date-fns';
import {Box, SelectChangeEvent} from '@mui/material';
import {GridRowsProp} from '@mui/x-data-grid';
import * as _ from 'lodash';

import {DataGridLayout} from 'components/DataGridLayout';
import {PageListingLayout} from 'components/PageListingLayout';
import {Widget} from 'components/Widget';
import {EmptySection} from 'components/EmptySection';
import {FilterFields} from 'components/FilterFields';
import {Progress} from 'components/Progress';
import {FormSelect} from 'components/form/FormSelect';
import {useQueryTechnicianEvents} from 'hooks/reactQuery/useTechnician';
import {useQueryUserAccounts} from 'hooks/reactQuery/useUserAccount';
import {TechnicianEventType} from 'models/misc';
import {UserView, Role} from 'models/user';
import {TechnicianEventPair} from 'models/technician';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {
  formatSearchParamsPageIndex,
  formatSearchParamsPageSize,
} from 'utils/utils';
import {toRestDateTime} from 'utils/datetime';
import {columns, makeRows} from './EmployeeDataGridProps';

const pageSize = 25;

export const Employees = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(makePage(0, pageSize));
  const [queryParams, setQueryParams] = useSearchParams();
  const totalEmployeeRef = useRef(0);
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [role, setRole] = useState<Role | string>('');

  const getRoles = () => {
    let roles: Role[] = [Role.SERVICE_MANAGER, Role.TECHNICIAN];
    if (role === 'SERVICE_MANAGER') {
      roles = [Role.SERVICE_MANAGER];
    } else if (role === 'TECHNICIAN') {
      roles = [Role.TECHNICIAN];
    }

    return roles;
  };

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
      roles: getRoles(),
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

    if (currentParams.pageSize)
      setPage({
        ...page,
        pageSize: Number(currentParams.pageSize),
      });
    if (currentParams.pageIndex)
      setPage({
        ...page,
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

  const handleRoleChange = (event: SelectChangeEvent<string | string[]>) => {
    const {
      target: {value},
    } = event;
    setRole(value as Role);
  };

  const handleClearFilters = () => {
    setSearch('');
    setRole('');
  };

  const renderFilterItems = () => (
    <FilterFields
      containerStyle={{alignSelf: 'center', height: '100%'}}
      wrapperStyle={{alignItems: 'center'}}
      onClear={handleClearFilters}>
      <Box
        sx={{
          minWidth: '350px',
          marginRight: '7px',
          alignItems: 'center',
        }}>
        <FormSelect
          labelId="roleFilter-label"
          label="Role"
          options={[
            {
              label: 'Technician',
              value: 'TECHNICIAN',
            },
            {
              label: 'Service Manager',
              value: 'SERVICE_MANAGER',
            },
          ]}
          labelStyles={{backgroundColor: 'transparent'}}
          selectStyles={{
            backgroundColor: 'white',
          }}
          selectProps={{
            labelId: 'roleFilter-label',
            value: role,
            onChange: handleRoleChange,
            name: 'roleFilter',
            multiple: false,
          }}
        />
      </Box>
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
          btnLabel="New employee"
          filterItems={renderFilterItems()}
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
    </PageListingLayout>
  );
};
