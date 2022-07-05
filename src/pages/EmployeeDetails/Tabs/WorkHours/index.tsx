import {useEffect, useState} from 'react';
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
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {calculateTotalTime} from 'utils/work-hours-utils';
import {getLastWeek} from 'utils/datetime';
import {columns, makeRows} from './WorkHoursDataGrid';

interface Props {
  employeeId: string;
}

const WorkHoursTab = ({employeeId}: Props) => {
  const {t} = useTranslation();
  const [startDate, setStartDate] = useState<Date>(getLastWeek());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [totalTime, setTotalTime] = useState<string>('00:00');
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(makePage(0, 10));

  const {data: workHours = createEmptyResource<WorkHoursItem>(10)} =
    useWorkHours(search, page, startDate, endDate, employeeId || '');

  useEffect(() => {
    if (workHours.data) {
      setRows(makeRows(workHours));
      setTotalTime(calculateTotalTime(workHours.data));
    } else {
      setRows([]);
      setTotalTime('00:00');
    }
  }, [workHours]);

  useEffect(() => {
    setPageCount(Math.ceil(workHours.total / page.pageSize));
  }, [workHours, page.pageSize]);

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
            if (newValue) setStartDate(newValue);
          }}
          textFieldProps={{
            label: t('Start Date'),
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
            if (newValue) setEndDate(newValue);
          }}
          textFieldProps={{
            label: t('End Date'),
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
      />
    </Box>
  );

  return (
    <TabContentContainer>
      {renderWidget()}
      <DataGridLayout
        rows={rows}
        columns={columns}
        hideFooter={pageCount <= 1}
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
      />
    </TabContentContainer>
  );
};

export default WorkHoursTab;
