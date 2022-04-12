import {useEffect, useState} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import {twentyFourHourTime} from 'utils/utils';
import * as _ from 'lodash';
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
import {formatDate, getDateObject, toRestDateTime} from 'utils/datetime';
import {useQueryServiceOrderSchedules} from 'hooks/reactQuery/useServiceOrder';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {ServiceOrderView} from 'models/service-order';
import {ScheduleContainer} from 'components/Schedules/ScheduleContainer';
import {ScheduleHeader} from 'components/Schedules/ScheduleHeader';
import {ScheduleRow} from 'components/Schedules/ScheduleRow';
import {ScheduleHeaderCell} from 'components/Schedules/ScheduleHeaderCell';
import {ScheduleBody} from 'components/Schedules/ScheduleBody';
import {ScheduleBodyCell} from 'components/Schedules/ScheduleBodyCell';
import {ScheduleItemContainer} from 'components/Schedules/ScheduleItemContainer';
import {ScheduleItem} from 'components/Schedules/ScheduleItem';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {grey} from '@mui/material/colors';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';

interface Props {
  technicianId?: string;
}

const gridWidth = 120;
const dateFormat = 'dd MMMM yy';

export const Schedule = ({technicianId}: Props) => {
  const theme = useTheme();
  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [tableHeader, setTableHeader] = useState<string[]>([]);
  const [page] = useState(makePage(0, 100));
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

  const {data: serviceOrders = createEmptyResource<ServiceOrderView>(10)} =
    useQueryServiceOrderSchedules({
      end: toRestDateTime(monthPair.endOfMonthDay),
      start: toRestDateTime(monthPair.startOfMonthDay),
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: '',
      technicianIds: technicianId ? [technicianId] : [],
    });

  const serviceOrderStatusColor: {[key: string]: string} = {
    SCHEDULED: '#00D1FF',
    IN_PROGRESS: theme.state?.ratingActive as string,
    COMPLETED: theme.palette.success.main,
    CANCELLED: grey[600],
    EXPIRED: theme.palette.error.main,
  };

  useEffect(() => {
    const monthBegins = formatDate(monthPair.startOfMonthDay, 'dd MMM');
    const montEnds = formatDate(monthPair.endOfMonthDay, 'dd MMM');
    setTableHeader([`${monthBegins} - ${montEnds}`, ...twentyFourHourTime]);
  }, [monthInterval]);

  useEffect(() => {
    const ordersByDate = _.groupBy(serviceOrders.data, (serviceOrder) =>
      formatDate(
        getDateObject(serviceOrder.schedules[0].startTime),
        dateFormat,
      ),
    );

    // Group holidays to the same time

    setOrders(ordersByDate);
  }, [serviceOrders]);

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

  const calculateWidth = (order: ServiceOrderView) => {
    const startDateTime = order.schedules[0].startTime;
    const endDateTime = order.schedules[0].endTime;
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
        height: '75vh',
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
                      return Object.keys(orders).map((xKey) => {
                        if (xKey === key) {
                          return (
                            <ScheduleBodyCell
                              key={`${rowIndex}-${index}`}
                              cellWidth={gridWidth}>
                              <ScheduleItemContainer>
                                {orders[xKey].map((order) => (
                                  // console.log(order, '>>>>>>>>>>>.', xKey);
                                  <ScheduleItem
                                    key={`${order.id}`}
                                    titleLeftAdornment={
                                      <ServiceOrderIcons
                                        style={{fontSize: '5rem'}}
                                        serviceOrderType={order.type}
                                      />
                                    }
                                    title={order.elevator.propertyOwner.name}
                                    subtitle={
                                      order.elevator.propertyOwner.address
                                        .fullName
                                    }
                                    width={calculateWidth(order)}
                                    cardStatusAccent={
                                      serviceOrderStatusColor[order.status]
                                    }
                                    marginLeft={calculatePosition(
                                      order.schedules[0].startTime,
                                    )}
                                  />
                                ))}
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
