import {ReactNode, useEffect, useRef, useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {twentyFourHourTime} from 'utils/utils';
import Box from '@mui/material/Box';
import * as _ from 'lodash';
import Typography from '@mui/material/Typography';
import {Divider} from '@mui/material';
import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  isBefore,
  startOfDay,
  subDays,
} from 'date-fns';
import {
  formatDate,
  getDateObject,
  getEndOfWeek,
  getStartOfWeek,
} from 'utils/datetime';
import {useTranslation} from 'react-i18next';
import {ScheduleContainer} from 'components/Schedules/ScheduleContainer';
import {ScheduleHeader} from 'components/Schedules/ScheduleHeader';
import {ScheduleRow} from 'components/Schedules/ScheduleRow';
import {ScheduleHeaderCell} from 'components/Schedules/ScheduleHeaderCell';
import {ScheduleBody} from 'components/Schedules/ScheduleBody';
import {ScheduleBodyCell} from 'components/Schedules/ScheduleBodyCell';
import {ScheduleItemContainer} from 'components/Schedules/ScheduleItemContainer';
import {WeekPair} from 'models/misc';
import {ServiceOrderView} from 'models/service-order';
import CardHeader from '@mui/material/CardHeader';
import {useTheme} from '@mui/material/styles';
import {EmployeesView} from 'models/employee';
import {styles as sx} from './styles';
import {ScheduleControls} from './ScheduleControls';
import {ScheduleLabel} from './ScheduleLabel';
import {ScheduledItemGroup} from './model';
import {getItemPosition, getItemWidth} from './utils';

interface Props {
  technicians?: EmployeesView[];
  scheduleItems: {[key: string]: ServiceOrderView[]};
  renderCellItem: (
    cellItem: any,
    width: string,
    position: {x: string; y: string},
  ) => void;
  getWeekPair?: (weekPair: WeekPair) => void;
  scheduleType?: 'date' | 'people' | 'default';
  defaultTypeLabel?: string;
  searchPlaceholder?: string;
  handleSearch?: (val: string) => void;
  containerStyles?: {[key: string]: any};
  footerContainerStyles?: {[key: string]: any};
  cardFooter?: ReactNode;
  makeLabelSelectable?: boolean;
  labelWidth?: string;
  cellHeight?: string;
  getCheckedValue?: (checked: boolean, value: string) => void;
  cardHeaderLabel?: string;
  customCardHeader?: JSX.Element;
  checkedValues?: string[];
}

const gridWidth = 200;
const dateFormat = 'dd MMMM yy';

export const Schedule = ({
  getWeekPair,
  scheduleItems,
  renderCellItem,
  scheduleType = 'default',
  searchPlaceholder = 'Search',
  handleSearch,
  containerStyles,
  cardFooter,
  defaultTypeLabel = '',
  makeLabelSelectable,
  labelWidth,
  getCheckedValue,
  cellHeight,
  cardHeaderLabel,
  customCardHeader,
  footerContainerStyles,
  technicians,
  checkedValues = [],
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [tableHeader, setTableHeader] = useState<string[]>([]);
  const elementRef = useRef<HTMLInputElement | undefined>();
  const [scheduleItemGroup, setScheduleItemGroup] =
    useState<ScheduledItemGroup>({});
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
  weekInterval.map((item) => formatDate(item, dateFormat));

  const [lookupDate, setLookupDate] = useState<any>(
    _.groupBy(
      weekInterval.map((item) => formatDate(item, dateFormat)),
      (item) => item,
    ),
  );

  const [lookupTechnician, setLookupTechnician] = useState<{
    [key: string]: EmployeesView[];
  }>({});

  useEffect(() => {
    const result: ScheduledItemGroup = {};
    Object.keys(scheduleItems).forEach((key) => {
      const items = scheduleItems[key];
      result[key] = {};
      let previousOrder: ServiceOrderView | null = null;

      items.forEach((item) => {
        if (previousOrder) {
          const previousEndTime = new Date(previousOrder.schedules[0].endTime);
          const currentOrderStartTime = new Date(item.schedules[0].startTime);
          if (isBefore(currentOrderStartTime, previousEndTime)) {
            const previousOrderNextLevel = result[key][previousOrder.id];
            result[key][item.id] = previousOrderNextLevel + 1;
          } else {
            result[key][item.id] = 1;
          }
        } else {
          result[key][item.id] = 1;
        }
        previousOrder = item;
      });
    });

    setScheduleItemGroup(result);
  }, [scheduleItems]);

  useEffect(() => {
    setLookupTechnician(_.groupBy(technicians, (technician) => technician.id));
  }, [technicians]);

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
        const result = Object.keys(lookupTechnician)?.map((key) => ({
          [key]: tableHeader,
        }));
        setBodyRow(result);
      }
    }
  }, [tableHeader, weekInterval, lookupTechnician]);

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
    setLookupDate(
      _.groupBy(
        weekInterval.map((item) => formatDate(item, dateFormat)),
        (item) => item,
      ),
    );
  }, [weekInterval]);

  useEffect(() => {
    const date = getDateObject(new Date());
    const h = formatDate(date, 'H');
    const m = formatDate(date, 'm');
    const scrollWidth = gridWidth * (Number(h) + Number(m) / 60);

    const timeout = window.setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.scroll({
          left: scrollWidth,
        });
      }
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const nextWeek = () => {
    const firstDayOfNextWeek = startOfDay(addDays(weekPair.endOfWeekDay, 1));
    const endOfNextWeek = getEndOfWeek(firstDayOfNextWeek, 1);
    setWeekPair({
      ...weekPair,
      startOfWeekDay: firstDayOfNextWeek,
      endOfWeekDay: endOfNextWeek,
    });
  };

  const prevWeek = () => {
    const endOfPrevWeek = endOfDay(subDays(weekPair.startOfWeekDay, 1));
    const firstDayOfPrevWeek = getStartOfWeek(endOfPrevWeek, 1);
    setWeekPair({
      ...weekPair,
      startOfWeekDay: firstDayOfPrevWeek,
      endOfWeekDay: endOfPrevWeek,
    });
  };

  return (
    <Card sx={[sx.card, {...containerStyles}]}>
      {customCardHeader || cardHeaderLabel ? (
        <CardHeader
          sx={{
            minHeight: '0',
          }}
          title={
            customCardHeader || (
              <Typography
                variant="subtitle2"
                sx={{
                  color: theme.palette.text.primary,
                }}>
                {cardHeaderLabel}
              </Typography>
            )
          }
        />
      ) : null}

      <Box ref={elementRef} sx={sx.mainContainer}>
        <CardContent sx={{padding: 0, width: '100%'}}>
          <ScheduleContainer>
            <ScheduleHeader>
              <ScheduleRow>
                {tableHeader.map((item, index) => {
                  if (index === 0) {
                    return (
                      <ScheduleHeaderCell key={index} labelWidth={labelWidth}>
                        <ScheduleControls
                          item={item}
                          prevWeek={prevWeek}
                          nextWeek={nextWeek}
                          getSearchValue={(searchValue) =>
                            handleSearch && handleSearch(searchValue)
                          }
                          searchPlaceholder={t(searchPlaceholder)}
                          scheduleType={scheduleType}
                        />
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

            <Divider
              absolute
              sx={[
                sx.divider,
                {
                  marginLeft: `${
                    gridWidth *
                    (1 + new Date().getHours() + new Date().getMinutes() / 60)
                  }px`,
                },
              ]}
              component="colgroup"
              orientation="vertical"
            />

            <ScheduleBody>
              {bodyRow.map((dayRow, rowIndex) => (
                <ScheduleRow key={rowIndex}>
                  {Object.keys(dayRow).map((key) =>
                    dayRow[key].map((item, index) => {
                      if (index === 0) {
                        const label =
                          scheduleType === 'date'
                            ? lookupDate[key]
                            : lookupTechnician[key] &&
                              `${lookupTechnician[key][0].userAccount.firstName} ${lookupTechnician[key][0].userAccount.lastName}`;
                        return (
                          <ScheduleBodyCell
                            cellWidth={gridWidth}
                            cellHeight={cellHeight}
                            key={`${rowIndex}-${index}`}>
                            <ScheduleLabel
                              id={key}
                              checkboxValue={key}
                              makeLabelSelectable={makeLabelSelectable}
                              getCheckedValue={getCheckedValue}
                              scheduleType={scheduleType}
                              scheduleItems={scheduleItems}
                              item={label || ''}
                              checkedValues={checkedValues}
                            />
                          </ScheduleBodyCell>
                        );
                      }

                      if (index === 1) {
                        return Object.keys(scheduleItems).map((xKey) => {
                          if (xKey === key) {
                            return (
                              <ScheduleBodyCell
                                cellHeight={cellHeight}
                                key={`${rowIndex}-${index}`}
                                cellWidth={gridWidth}>
                                <ScheduleItemContainer>
                                  {scheduleItems[xKey].map((scheduleItem) =>
                                    renderCellItem(
                                      scheduleItem,
                                      getItemWidth({
                                        startDateTime:
                                          scheduleItem.schedules[0].startTime,
                                        endDateTime:
                                          scheduleItem.schedules[0].endTime,
                                        gridWidth,
                                      }),
                                      getItemPosition({
                                        scheduleItemGroup,
                                        startDateTime:
                                          scheduleItem.schedules[0].startTime,
                                        rowKey: xKey,
                                        orderId: scheduleItem.id,
                                        gridWidth,
                                      }),
                                    ),
                                  )}
                                </ScheduleItemContainer>
                              </ScheduleBodyCell>
                            );
                          }
                          return null;
                        });
                      }
                      return (
                        <ScheduleBodyCell
                          cellHeight={cellHeight}
                          key={`${rowIndex}-${index}`}
                        />
                      );
                    }),
                  )}
                </ScheduleRow>
              ))}
            </ScheduleBody>
          </ScheduleContainer>
        </CardContent>

        {cardFooter ? (
          <Box sx={[sx.footerContainer, footerContainerStyles || {}]}>
            {cardFooter}
          </Box>
        ) : null}
      </Box>
    </Card>
  );
};
