import {useEffect, useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {twentyFourHourTime} from 'utils/utils';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  addDays,
  differenceInMinutes,
  eachDayOfInterval,
  endOfMonth,
  startOfDay,
  startOfMonth,
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

interface Props {
  scheduleItems: {[key: string]: any[]};
  renderCellItem: (
    cellItem: any,
    calcWidth: (startDateTime: string, endDateTime: string) => string,
    calcPosition: (startDateTime: string) => string,
  ) => void;
  getMonthPair?: (monthPair: {
    startOfMonthDay: Date;
    endOfMonthDay: Date;
  }) => void;
}

const gridWidth = 120;
const dateFormat = 'dd MMMM yy';

export const Schedule = ({
  getMonthPair,
  scheduleItems,
  renderCellItem,
}: Props) => {
  const [tableHeader, setTableHeader] = useState<string[]>([]);
  const [monthPair, setMonthPair] = useState({
    startOfMonthDay: startOfMonth(new Date()),
    endOfMonthDay: endOfMonth(new Date()),
  });
  const [bodyRow, setBodyRow] = useState<{[key: string]: string[]}[]>([]);
  const [monthInterval, setMonthInterval] = useState(
    eachDayOfInterval({
      start: monthPair.startOfMonthDay,
      end: monthPair.endOfMonthDay,
    }),
  );

  useEffect(() => {
    const monthBegins = formatDate(monthPair.startOfMonthDay, 'dd MMM');
    const montEnds = formatDate(monthPair.endOfMonthDay, 'dd MMM');
    setTableHeader([`${monthBegins} - ${montEnds}`, ...twentyFourHourTime]);
  }, [monthInterval]);

  useEffect(() => {
    if (tableHeader.length) {
      const result = monthInterval.map((item) => {
        const key = formatDate(item, dateFormat);
        return {[key!]: tableHeader};
      });
      setBodyRow(result);
    }
  }, [tableHeader]);

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

  useEffect(() => {
    const interval = eachDayOfInterval({
      start: monthPair.startOfMonthDay,
      end: monthPair.endOfMonthDay,
    });

    setMonthInterval(interval);
    if (getMonthPair) {
      getMonthPair(monthPair);
    }
  }, [monthPair]);

  const nextMonth = () => {
    const firstDayOfNextMonth = addDays(monthPair.endOfMonthDay, 1);
    const endOfNextMonth = endOfMonth(firstDayOfNextMonth);
    setMonthPair({
      ...monthPair,
      startOfMonthDay: firstDayOfNextMonth,
      endOfMonthDay: endOfNextMonth,
    });
  };

  const prevMonth = () => {
    const endOfPrevMonth = subDays(monthPair.startOfMonthDay, 1);
    const firstDayOfPrevMonth = startOfMonth(endOfPrevMonth);
    setMonthPair({
      ...monthPair,
      startOfMonthDay: firstDayOfPrevMonth,
      endOfMonthDay: endOfPrevMonth,
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
      <CardContent sx={{overflowX: 'scroll', padding: 0}}>
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
    </Card>
  );
};
