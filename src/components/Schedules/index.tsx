/* eslint-disable */
import {ReactNode, useEffect, useRef, useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {twentyFourHourTime} from 'utils/utils';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  addDays,
  differenceInMinutes,
  eachDayOfInterval,
  startOfDay,
  subDays,
} from 'date-fns';
import {
  formatDate,
  getDateObject,
  getEndOfWeek,
  getStartOfWeek,
} from 'utils/datetime';
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
import {grey} from '@mui/material/colors';
import {ServiceOrderView} from 'models/service-order';
import {SearchInput} from 'components/SearchInput';
import {styles as sx} from './styles';
import {ScheduleControls} from './ScheduleControls';

interface Props {
  scheduleItems: {[key: string]: ServiceOrderView[]};
  renderCellItem: (
    cellItem: any,
    calcWidth: (startDateTime: string, endDateTime: string) => string,
    calcPosition: (startDateTime: string) => string,
  ) => void;
  getWeekPair?: (weekPair: WeekPair) => void;
  scheduleType?: 'date' | 'people' | 'default';
  defaultTypeLabel?: string;
  searchPlaceholder?: string;
  bodyLabel?: string[];
  handleSearch?: (val: string) => void;
  containerStyles?: {[key: string]: string | number};
  cardFooter?: ReactNode;
  makeLabelSelectable?: boolean;
}

const gridWidth = 120;
const dateFormat = 'dd MMMM yy';

export const Schedule = ({
  getWeekPair,
  scheduleItems,
  renderCellItem,
  scheduleType = 'default',
  searchPlaceholder = 'Search',
  bodyLabel = [],
  handleSearch,
  containerStyles,
  cardFooter,
  defaultTypeLabel = '',
  makeLabelSelectable,
}: Props) => {
  const [tableHeader, setTableHeader] = useState<string[]>([]);
  const elementRef = useRef<HTMLInputElement | undefined>();
  const [weekPair, setWeekPair] = useState<WeekPair>({
    startOfWeekDay: getStartOfWeek(new Date(), 1),
    endOfWeekDay: getEndOfWeek(new Date(), 1),
  });
  const [bodyRow, setBodyRow] = useState<{[key: string]: string[]}[]>([]);
  const [weekInterval, setWeekInterval] = useState(
    eachDayOfInterval({
      start: weekPair.startOfWeekDay,
      end: weekPair.endOfWeekDay,
    }),
  );

  console.log(scheduleType, '.......');

  useEffect(() => {
    if (scheduleType === 'date') {
      const weekBegins = formatDate(weekPair.startOfWeekDay, 'dd MMM');
      const weekEnds = formatDate(weekPair.endOfWeekDay, 'dd MMM');
      setTableHeader([`${weekBegins} - ${weekEnds}`, ...twentyFourHourTime]);
    } else if (scheduleType === 'people') {
      setTableHeader([searchPlaceholder, ...twentyFourHourTime]);
    } else {
      setTableHeader([defaultTypeLabel, ...twentyFourHourTime]);
    }
  }, [weekInterval, searchPlaceholder, scheduleType]);

  useEffect(() => {
    if (tableHeader.length) {
      if (scheduleType === 'date') {
        const result = weekInterval.map((item) => {
          const key = formatDate(item, dateFormat);
          return {[key!]: tableHeader};
        });
        setBodyRow(result);
      } else {
        const result = bodyLabel?.map((label) => ({[label]: tableHeader}));
        setBodyRow(result);
      }
    }
  }, [tableHeader, bodyLabel]);

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

    const timeout = window.setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.scroll({
          left: scrollWidth,
          behavior: 'smooth',
        });
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

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
    const endOfNextWeek = getEndOfWeek(firstDayOfNextWeek, 1);
    setWeekPair({
      ...weekPair,
      startOfWeekDay: firstDayOfNextWeek,
      endOfWeekDay: endOfNextWeek,
    });
  };

  const prevMonth = () => {
    const endOfPrevWeek = subDays(weekPair.startOfWeekDay, 1);
    const firstDayOfPrevWeek = getStartOfWeek(endOfPrevWeek, 1);
    setWeekPair({
      ...weekPair,
      startOfWeekDay: firstDayOfPrevWeek,
      endOfWeekDay: endOfPrevWeek,
    });
  };

  const scheduleControls = (item: string) => {
    if (scheduleType === 'date') {
      return (
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
      );
    }

    if (scheduleType === 'people') {
      return (
        <SearchInput
          placeholder={searchPlaceholder}
          onValueChanged={(searchValue) =>
            handleSearch && handleSearch(searchValue)
          }
          containerStyle={{
            background: '#fff',
            width: '90%',
          }}
        />
      );
    }
  };

  const renderScheduleLabel = (item: string) => (
    <Typography component="div" variant="subtitle2">
      {item} <br />
      <Typography variant="caption" sx={{color: grey[600]}}>
        {scheduleType === 'date'
          ? formatDate(new Date(item), 'EEEE')
          : scheduleItems[item]
          ? `${scheduleItems[item].length} ${
              scheduleItems[item].length < 2 ? ' Order' : ' Orders'
            }`
          : '0 Order'}
      </Typography>
    </Typography>
  );

  return (
    <Card sx={[sx.card, {...containerStyles}]}>
      <Box ref={elementRef} sx={sx.mainContainer}>
        <CardContent sx={{padding: 0}}>
          <ScheduleContainer>
            <ScheduleHeader>
              <ScheduleRow>
                {tableHeader.map((item, index) => {
                  if (index === 0) {
                    return (
                      <ScheduleHeaderCell key={index}>
                        {/* <ScheduleControls
                          item={item}
                          prevMonth={prevMonth}
                          nextMonth={nextMonth}
                          getSearchValue={(searchValue) =>
                            handleSearch && handleSearch(searchValue)
                          }
                          searchPlaceholder={searchPlaceholder}
                          scheduleType={scheduleType}
                        /> */}
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
                        const technician = scheduleItems[key];
                        console.log(technician, '<<<<<<<>>>>>>>>.......');
                        return scheduleType === 'default' ? null : (
                          <ScheduleBodyCell
                            cellWidth={gridWidth}
                            key={`${rowIndex}-${index}`}>
                            {renderScheduleLabel(key)}
                          </ScheduleBodyCell>
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

        {cardFooter ? <Box sx={sx.footerContainer}>{cardFooter}</Box> : null}
      </Box>
    </Card>
  );
};
