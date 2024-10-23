import {useEffect, useRef, useState} from 'react';
import {Box, Typography} from '@mui/material';
import {GridRowsProp} from '@mui/x-data-grid';
import {useTranslation} from 'react-i18next';
import {DataGridLayout} from 'components/DataGridLayout';
import {FilterFields} from 'components/FilterFields';
import {TabContentContainer} from 'components/TabContentContainer';
import {Widget} from 'components/Widget';
import {DatePicker} from 'components/DatePicker';
import TotalTime from 'components/TotalTime';
import {useWorkHours} from 'hooks/reactQuery/useWorkHours';
import {WorkHoursItem} from 'models/workHours';
import {createEmptyResource, makePage} from 'utils/paging';
import {calculateTotalTime} from 'utils/work-hours-utils';
import {endOfDay, startOfDay} from 'date-fns';
import {useFormatDate} from 'hooks/useFormatDate';
import {useQueryState} from 'hooks/useQueryState';
import {getLastWeek} from 'utils/datetime';
import {useNavigate} from 'react-router';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  useCompanyJobTypes,
  useOldCompanyJobTypes,
} from 'hooks/reactQuery/useCompanies';
import {columns, makeRows} from './WorkHoursDataGrid';

interface Props {
  employeeId: string;
}

const WorkHoursTab = ({employeeId}: Props) => {
  const {t} = useTranslation();
  const formatDate = useFormatDate();
  const [startDate, setStartDate] = useState<Date>(getLastWeek());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [search, setSearch] = useQueryState('searchWorkHours');
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [totalTime, setTotalTime] = useState<string>('00:00');
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(makePage(0, 10));
  const textInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {data: workHours = createEmptyResource<WorkHoursItem>(10)} =
    useWorkHours(search, page, startDate, endDate, employeeId || '');

  const {user} = useUserSession();
  const {data: jobTypes = []} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );
  const {data: oldJobTypes = []} = useOldCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  const allJobTypes = [
    ...jobTypes,
    ...oldJobTypes.filter(
      (oldJobType) =>
        !jobTypes.some((jobType) => jobType.name === oldJobType.name),
    ),
  ];

  useEffect(() => {
    if (workHours.data) {
      setRows(makeRows(workHours, formatDate, allJobTypes));
      setTotalTime(calculateTotalTime(workHours.data));
    } else {
      setRows([]);
      setTotalTime('00:00');
    }
  }, [workHours, formatDate, user, jobTypes]);

  useEffect(() => {
    setPageCount(Math.ceil(workHours.total / page.pageSize));
  }, [workHours, page.pageSize]);

  useEffect(() => {
    if (textInput.current) {
      textInput.current.value = search;
    }
  }, [search]);

  const renderFilterItems = () => (
    <Box sx={{display: 'flex', justifyContent: 'flex-end', width: '100%'}}>
      <FilterFields
        containerStyle={{alignSelf: 'center'}}
        wrapperStyle={{alignItems: 'center'}}
        hideClear>
        <DatePicker
          defaultDate={startDate}
          minDate={undefined}
          maxDate={endDate}
          getSelectedDate={(newValue) => {
            if (newValue) setStartDate(startOfDay(newValue));
          }}
          textFieldProps={{
            label: t('Start Date'),
            sx: {
              background: 'white',
            },
          }}
        />
        <Typography sx={{margin: '0 16px', color: '#8F9BB3', fontSize: '14px'}}>
          {t('to')}
        </Typography>
        <DatePicker
          defaultDate={endDate}
          minDate={startDate}
          maxDate={new Date()}
          getSelectedDate={(newValue) => {
            if (newValue) setEndDate(endOfDay(newValue));
          }}
          textFieldProps={{
            label: t('End Date'),
            sx: {
              background: 'white',
            },
          }}
        />
      </FilterFields>
      <TotalTime time={totalTime} />
    </Box>
  );

  const renderWidget = () => (
    <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: '0.5em'}}>
      <Widget
        searchPlaceholder="Search by order type, order number etc."
        getSearchValue={(val) => setSearch(val)}
        filterItems={renderFilterItems()}
        refInput={textInput}
      />
    </Box>
  );

  return (
    <TabContentContainer>
      {renderWidget()}
      <DataGridLayout
        rows={rows}
        columns={columns}
        scrollToTop={search}
        pageSize={page.pageSize}
        handlePageSizeChange={(newPageSize: number) =>
          setPage({...page, pageSize: newPageSize})
        }
        handlePageChange={(newPage: number) => {
          setPage({...page, pageIndex: newPage - 1});
        }}
        isCellClickable={false}
        pageCount={pageCount}
        totalRows={workHours.total}
        onRowClick={(row) => {
          const {orderId, type} = row.row;
          if (orderId !== '' && type.startsWith('SERVICE_ORDER_')) {
            navigate(`/orders/details/${orderId}`);
          }
        }}
      />
    </TabContentContainer>
  );
};

export default WorkHoursTab;
