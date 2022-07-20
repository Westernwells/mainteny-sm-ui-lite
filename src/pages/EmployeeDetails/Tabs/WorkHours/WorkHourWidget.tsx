import {useEffect, useState} from 'react';
import {useParams} from 'react-router';
import {addDays, endOfDay, startOfDay, subDays} from 'date-fns';
import {Box, Typography} from '@mui/material';
import {GridRowsProp} from '@mui/x-data-grid';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import {DataGridLayout} from 'components/DataGridLayout';
import {TabContentContainer} from 'components/TabContentContainer';
import {useTranslation} from 'react-i18next';
import TotalTime from 'components/TotalTime';
import {useWorkHours} from 'hooks/reactQuery/useWorkHours';
import {WorkHoursItem} from 'models/workHours';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {calculateTotalTime} from 'utils/work-hours-utils';
import {useWhen} from 'hooks/useWhen';
import {columnsWidget, makeRows} from './WorkHoursDataGrid';

const WorkHourWidget = () => {
  const getWhen = useWhen();
  const {t} = useTranslation();
  const {id: employeeId} = useParams();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [totalTime, setTotalTime] = useState<string>('00:00');
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(makePage(0, 10));

  const {data: workHours = createEmptyResource<WorkHoursItem>(10)} =
    useWorkHours(
      '',
      page,
      startOfDay(currentDate),
      endOfDay(currentDate),
      employeeId || '',
    );

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

  const nextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const prevDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const renderWidget = () => (
    <Box
      sx={{
        display: 'flex',
        mb: '0.5em',
        alignItems: 'center',
      }}>
      <Box
        sx={{
          display: 'flex',
          background: '#fff',
          py: '0.5em',
          px: '1em',
          minWidth: '10rem',
          justifyContent: 'space-between',
        }}>
        <Box onClick={() => prevDay()} sx={{cursor: 'pointer'}}>
          <ArrowBackIosIcon sx={{fontSize: '0.8rem'}} />
        </Box>
        <Typography variant="tableHeaderText" ml="0.5em" mr="0.9em">
          {t(`${getWhen(currentDate)}`)}
        </Typography>
        <Box onClick={() => nextDay()} sx={{cursor: 'pointer'}}>
          <ArrowForwardIosIcon sx={{fontSize: '0.8rem'}} />
        </Box>
      </Box>
      <TotalTime time={totalTime} />
    </Box>
  );

  return (
    <TabContentContainer>
      {renderWidget()}
      <DataGridLayout
        rows={rows}
        columns={columnsWidget}
        hideFooter={pageCount <= 1}
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
        isWidget
        containerStyle={{minHeight: '21.875em'}}
      />
    </TabContentContainer>
  );
};

export default WorkHourWidget;
