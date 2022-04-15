import {useEffect, useState} from 'react';
import {useQueryServiceOrderSchedules} from 'hooks/reactQuery/useServiceOrder';
import * as _ from 'lodash';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {formatDate, getDateObject, toRestDateTime} from 'utils/datetime';
import {endOfWeek, startOfWeek} from 'date-fns';
import {ServiceOrderView} from 'models/service-order';

import {Schedule} from 'components/Schedules';
import {ScheduleItem} from 'components/Schedules/ScheduleItem';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {useServiceOrderStatusColor} from 'hooks/useServiceOrderStatusColor';
import {ServiceOrderStatusIndicator} from 'components/ServiceOrderStatusIndicator';
import {WeekPair} from 'models/misc';
import {OrderDetails} from './OrderDetails';

interface Props {
  technicianId?: string;
}

const dateFormat = 'dd MMMM yy';

export const ScheduleTab = ({technicianId}: Props) => {
  const [serviceOrderStatusColor] = useServiceOrderStatusColor();
  const [weekPair, setWeekPair] = useState<WeekPair>({
    startOfWeekDay: startOfWeek(new Date()),
    endOfWeekDay: endOfWeek(new Date()),
  });
  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [page] = useState(makePage(0, 100));
  const {data: serviceOrders = createEmptyResource<ServiceOrderView>(10)} =
    useQueryServiceOrderSchedules({
      end: toRestDateTime(weekPair?.endOfWeekDay),
      start: toRestDateTime(weekPair?.startOfWeekDay),
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: '',
      technicianIds: technicianId ? [technicianId] : [],
    });

  useEffect(() => {
    const ordersByDate = _.groupBy(serviceOrders.data, (serviceOrder) =>
      formatDate(
        getDateObject(serviceOrder.schedules[0].startTime),
        dateFormat,
      ),
    );

    setOrders(ordersByDate);
  }, [serviceOrders]);

  return (
    <>
      <ServiceOrderStatusIndicator />
      <Schedule
        getWeekPair={(pair) => setWeekPair(pair)}
        scheduleItems={orders}
        renderCellItem={(order: ServiceOrderView, calWidth, calcPosition) => (
          <ScheduleItem
            key={order.id}
            titleLeftAdornment={
              <ServiceOrderIcons
                serviceOrderType={order.type}
                style={{fontSize: '1rem'}}
              />
            }
            title={order.elevator.propertyOwner.name}
            subtitle={order.elevator.address.fullName}
            width={calWidth(
              order.schedules[0].startTime,
              order.schedules[0].endTime,
            )}
            tooltip={<OrderDetails order={order} />}
            cardStatusAccent={serviceOrderStatusColor[order.status]}
            position={calcPosition(order.schedules[0].startTime)}
          />
        )}
      />
    </>
  );
};
