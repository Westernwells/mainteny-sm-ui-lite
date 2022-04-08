/* eslint-disable */
import React, {
  ReactNode,
  RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import {daysTime, twentyFourHourTime} from 'utils/utils';
import * as _ from 'lodash';
import Box, {BoxProps} from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  differenceInMinutes,
  eachDayOfInterval,
  endOfWeek,
  getDay,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import {
  formatDate,
  getDateObject,
  setDateTime,
  toRestDateTime,
} from 'utils/datetime';
import {styled} from '@mui/material/styles';
import {TypographyVariant} from '@mui/material';
import {serviceOrder} from './data';
import {useQueryServiceOrderSchedules} from 'hooks/reactQuery/useServiceOrder';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {ServiceOrderView} from 'models/service-order';
import {ScheduleContainer} from 'components/Schedules/ScheduleContainer';
import {ScheduleHeader} from 'components/Schedules/ScheduleHeader';
import {ScheduleRow} from 'components/Schedules/ScheduleRow';
import {ScheduleHeaderCell} from 'components/Schedules/ScheduleHeaderCell';
import {ScheduleBody} from 'components/Schedules/ScheduleBody';
import {ScheduleBodyCell} from 'components/Schedules/ScheduleBodyCell';
import {ScheduleOrderContainer} from 'components/Schedules/ScheduleOrderContainer';
import ScheduleOrder from 'components/Schedules/ScheduleOrder';

interface Props {
  technicianId?: string;
}

interface ScheduleGridItemProps extends BoxProps {
  label?: string | null;
  variant?: TypographyVariant;
  children?: ReactNode;
}

interface OrderProps extends BoxProps {
  refId?: string;
  label?: string | null;
  innerRef?: (ele: HTMLDivElement) => HTMLDivElement;
  variant?: TypographyVariant;
  children?: ReactNode;
  showMarker?: {[key: string]: any};
  setOrderRendered?: (val: {[key: string]: boolean}) => void;
  orderRendered: {[key: string]: boolean};
  orderId?: string | null;
  gridItemRef: React.MutableRefObject<{[key: string]: HTMLDivElement}>;
}

const gridHeight = 65;
const gridWidth = 120;
const dateFormat = 'dd MMMM YYY';

const orderTypeColor: {[key: string]: string} = {
  REGULAR: '#00D68F',
  EMERGENCY: '#FFAA00',
  REPAIR: '#2A19A5',
  CALLOUT: 'purple',
};

export const Schedule = ({technicianId}: Props) => {
  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [orderRendered, setOrderRendered] = useState<{[key: string]: boolean}>(
    {},
  );
  const [page] = useState(makePage(0, 100));
  const startOfWeekDay = startOfWeek(new Date());
  const endOfWeekDay = endOfWeek(new Date());
  const [timeMap, setTimeMap] = useState<{[key: string]: string[]}[]>([]);
  const [showMarker, setShowMarker] = useState<{
    [key: string]: any;
  }>({});
  const gridItemRef = useRef<{[key: string]: HTMLDivElement}>({});
  const gridColumnContainerRef = useRef<HTMLDivElement | null>(null);
  const interval = eachDayOfInterval({
    start: startOfWeekDay,
    end: endOfWeekDay,
  });
  const {data: serviceOrders = createEmptyResource<ServiceOrderView>(10)} =
    useQueryServiceOrderSchedules({
      end: toRestDateTime(endOfWeekDay),
      start: toRestDateTime(startOfWeekDay),
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: '',
      technicianIds: technicianId ? [technicianId] : [],
    });

  // console.log(serviceOrders, '"?+++++++++++++++===========>>>');

  useEffect(() => {
    const ordersByDate = _.groupBy(serviceOrders.data, (serviceOrder) =>
      formatDate(
        getDateObject(serviceOrder.schedules[0].startTime),
        dateFormat,
      ),
    );

    setOrders(ordersByDate);
  }, [serviceOrders]);

  useEffect(() => {
    const result = interval.map((item) => {
      const key = formatDate(item, dateFormat);
      return {[key!]: twentyFourHourTime};
    });

    setTimeMap(result);
  }, []);

  const calculatePosition = (startDateTime: string) => {
    const morningTime = startOfDay(new Date(startDateTime));
    const orderStartTime = getDateObject(startDateTime);
    // console.log(orderStartTime, ';;;;;;>>' , morningTime, )
    const result =
      gridWidth * (differenceInMinutes(orderStartTime, morningTime) / 60);
    // console.log(result, '}}}}}}}}}}')
    return result + 'px';
  };

  const calculateWidth = (order: ServiceOrderView) => {
    // console.log(order, '???????///');
    const startDateTime = order.schedules[0].startTime;
    const endDateTime = order.schedules[0].endTime;
    const width =
      (differenceInMinutes(
        getDateObject(endDateTime),
        getDateObject(startDateTime),
      ) /
        60) *
      gridWidth;

    return width + 'px';
  };

  return (
    <Card
      sx={{
        border: 'none',
        overflowY: 'scroll',
        height: '80vh',
      }}>
      {/* {console.log(interval)} */}
      <CardHeader sx={{pb: '0'}} title="Header" />
      <CardContent sx={{width: '84vw', overflowX: 'scroll'}}>
        <ScheduleContainer>
          <ScheduleHeader>
            <ScheduleRow>
              {twentyFourHourTime.map((item, index) => (
                <ScheduleHeaderCell key={index} label={item} />
              ))}
            </ScheduleRow>
          </ScheduleHeader>
          <ScheduleBody>
            {timeMap.map((dayRow, rowIndex) => {
              return (
                <ScheduleRow key={rowIndex}>
                  {Object.keys(dayRow).map((key) => {
                    return dayRow[key].map((item, index) => {
                      if (index === 0) {
                        return (
                          <ScheduleBodyCell
                            key={`${rowIndex}-${index}`}
                            label={key}
                          />
                        );
                      }

                      if (index === 1) {
                        return Object.keys(orders).map((xKey) => {
                          console.log(key, key === xKey, '>>>>>>>>>>>.', xKey);
                          if (xKey === key) {
                            return (
                              <ScheduleBodyCell key={`${rowIndex}-${index}`}>
                                <ScheduleOrderContainer>
                                  {orders[xKey].map((order) => {
                                    // console.log(order, '>>>>>>>>>>>.', xKey);
                                    return (
                                      <ScheduleOrder
                                        key={`${xKey}-${index}`}
                                        label={order.id}
                                        width={calculateWidth(order)}
                                        marginLeft={calculatePosition(
                                          order.schedules[0].startTime,
                                        )}
                                      />
                                    );
                                  })}
                                </ScheduleOrderContainer>
                              </ScheduleBodyCell>
                            );
                          }
                        });
                      }
                      return <ScheduleBodyCell key={`${rowIndex}-${index}`} />;
                    });
                  })}
                </ScheduleRow>
              );
            })}
          </ScheduleBody>
        </ScheduleContainer>
      </CardContent>
    </Card>
  );
};
