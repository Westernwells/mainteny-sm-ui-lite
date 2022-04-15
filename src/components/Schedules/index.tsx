import {useEffect, useRef, useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {twentyFourHourTime} from 'utils/utils';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  addDays,
  differenceInMinutes,
  eachDayOfInterval,
  endOfWeek,
  startOfDay,
  startOfWeek,
  subDays,
} from 'date-fns';
import {formatDate, getDateObject} from 'utils/datetime';
import {ScheduleContainer} from 'components/Schedules/ScheduleContainer';
import {ScheduleHeader} from 'components/Schedules/ScheduleHeader';
import {ScheduleRow} from 'components/Schedules/ScheduleRow';
import {ScheduleHeaderCell} from 'components/Schedules/ScheduleHeaderCell';
import {ScheduleBody} from 'components/Schedules/ScheduleBody';
import {ScheduleBodyCell} from 'components/Schedules/ScheduleBodyCell';
import {ScheduleItemContainer} from 'components/Schedules/ScheduleItemContainer';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {WeekPair} from 'models/misc';

interface Props {
  scheduleItems: {[key: string]: any[]};
  renderCellItem: (
    cellItem: any,
    calcWidth: (startDateTime: string, endDateTime: string) => string,
    calcPosition: (startDateTime: string) => string,
  ) => void;
  getWeekPair?: (weekPair: WeekPair) => void;
}

const gridWidth = 120;
const dateFormat = 'dd MMMM yy';

export const Schedule = ({
  getWeekPair,
  scheduleItems,
  renderCellItem,
}: Props) => {
  const [tableHeader, setTableHeader] = useState<string[]>([]);
  const elementRef = useRef<HTMLInputElement | undefined>();
  const [weekPair, setWeekPair] = useState<WeekPair>({
    startOfWeekDay: startOfWeek(new Date()),
    endOfWeekDay: endOfWeek(new Date()),
  });
  const [bodyRow, setBodyRow] = useState<{[key: string]: string[]}[]>([]);
  const [weekInterval, setWeekInterval] = useState(
    eachDayOfInterval({
      start: weekPair.startOfWeekDay,
      end: weekPair.endOfWeekDay,
    }),
  );

  useEffect(() => {
    const weekBegins = formatDate(weekPair.startOfWeekDay, 'dd MMM');
    const weekEnds = formatDate(weekPair.endOfWeekDay, 'dd MMM');
    setTableHeader([`${weekBegins} - ${weekEnds}`, ...twentyFourHourTime]);
  }, [weekInterval]);

  useEffect(() => {
    if (tableHeader.length) {
      const result = weekInterval.map((item) => {
        const key = formatDate(item, dateFormat);
        return {[key!]: tableHeader};
      });
      setBodyRow(result);
    }
  }, [tableHeader]);

  useEffect(() => {
    const interval = eachDayOfInterval({
      start: weekPair.startOfWeekDay,
      end: weekPair.endOfWeekDay,
    });

    setWeekInterval(interval);
    if (getWeekPair) {
      getWeekPair(weekPair);
    }
  }, [weekPair]);

  useEffect(() => {
    const date = getDateObject(new Date());
    const h = formatDate(date, 'H');
    const m = formatDate(date, 'm');
    const scrollWidth = gridWidth * (Number(h) + Number(m) / 60);

    // elementRef.current.scrollLeft = scrollWidth;
    const timeout = window.setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.scroll({
          left: scrollWidth,
          behavior: 'smooth'
        })
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [bodyRow]);

  const calculatePosition = (startDateTime: string) => {
    const morningTime = startOfDay(new Date(startDateTime));
    const orderStartTime = getDateObject(startDateTime);
    const result =
      gridWidth * (differenceInMinutes(orderStartTime, morningTime) / 60);
    return `${result}px`;
  };

  const calculateWidth = (startDateTime: string, endDateTime: string) => {
    const width =
      (differenceInMinutes(
        getDateObject(endDateTime),
        getDateObject(startDateTime),
      ) /
        60) *
      gridWidth;

    return `${width}px`;
  };

  const nextMonth = () => {
    const firstDayOfNextWeek = addDays(weekPair.endOfWeekDay, 1);
    const endOfNextWeek = endOfWeek(firstDayOfNextWeek);
    setWeekPair({
      ...weekPair,
      startOfWeekDay: firstDayOfNextWeek,
      endOfWeekDay: endOfNextWeek,
    });
  };

  const prevMonth = () => {
    const endOfPrevWeek = subDays(weekPair.startOfWeekDay, 1);
    const firstDayOfPrevWeek = startOfWeek(endOfPrevWeek);
    setWeekPair({
      ...weekPair,
      startOfWeekDay: firstDayOfPrevWeek,
      endOfWeekDay: endOfPrevWeek,
    });
  };

  const scheduleControls = (item: string) => (
    <Box>
      <Box sx={{display: 'flex'}}>
        <Box onClick={() => prevMonth()} sx={{cursor: 'pointer'}}>
          <ArrowBackIosIcon sx={{fontSize: '0.8rem'}} />
        </Box>

        <Typography variant="tableHeaderText" ml="0.5em" mr="0.9em">
          {item}
        </Typography>
        <Box onClick={() => nextMonth()} sx={{cursor: 'pointer'}}>
          <ArrowForwardIosIcon sx={{fontSize: '0.8rem'}} />
        </Box>
      </Box>
    </Box>
  );

  return (
    <Card
      sx={{
        border: 'none',
        overflowY: 'scroll',
        height: '72vh',
      }}>
      <Box ref={elementRef} sx={{overflowX: 'scroll'}}>
        <CardContent sx={{padding: 0}}>
          <ScheduleContainer>
            <ScheduleHeader>
              <ScheduleRow>
                {tableHeader.map((item, index) => {
                  if (index === 0) {
                    return (
                      <ScheduleHeaderCell key={index}>
                        {scheduleControls(item)}
                      </ScheduleHeaderCell>
                    );
                  }
                  return (
                    <ScheduleHeaderCell
                      cellWidth={gridWidth}
                      key={index}
                      label={item}
                    />
                  );
                })}
              </ScheduleRow>
            </ScheduleHeader>
            <ScheduleBody>
              {bodyRow.map((dayRow, rowIndex) => (
                <ScheduleRow key={rowIndex}>
                  {Object.keys(dayRow).map((key) =>
                    dayRow[key].map((item, index) => {
                      if (index === 0) {
                        return (
                          <ScheduleBodyCell
                            cellWidth={gridWidth}
                            key={`${rowIndex}-${index}`}
                            label={key}
                          />
                        );
                      }

                      if (index === 1) {
                        return Object.keys(scheduleItems).map((xKey) => {
                          if (xKey === key) {
                            return (
                              <ScheduleBodyCell
                                key={`${rowIndex}-${index}`}
                                cellWidth={gridWidth}>
                                <ScheduleItemContainer>
                                  {scheduleItems[xKey].map((scheduleItem) =>
                                    renderCellItem(
                                      scheduleItem,
                                      calculateWidth,
                                      calculatePosition,
                                    ),
                                  )}
                                </ScheduleItemContainer>
                              </ScheduleBodyCell>
                            );
                          }
                          return null;
                        });
                      }
                      return <ScheduleBodyCell key={`${rowIndex}-${index}`} />;
                    }),
                  )}
                </ScheduleRow>
              ))}
            </ScheduleBody>
          </ScheduleContainer>
        </CardContent>
      </Box>
    </Card>
  );
};
