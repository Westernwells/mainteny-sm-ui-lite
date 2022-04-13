import React, {useEffect, useState} from 'react';
import {useQueryServiceOrderSchedules} from 'hooks/reactQuery/useServiceOrder';
import * as _ from 'lodash';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {formatDate, getDateObject, toRestDateTime} from 'utils/datetime';
import {endOfMonth, startOfMonth} from 'date-fns';
import {ServiceOrderView} from 'models/service-order';
import {Schedule} from 'components/Schedules';
import {ScheduleItem} from 'components/Schedules/ScheduleItem';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {useServiceOrderStatusColor} from 'hooks/useServiceOrderStatusColor';
import {ServiceOrderStatusIndicator} from 'components/ServiceOrderStatusIndicator';

interface Props {
  technicianId?: string;
}

const dateFormat = 'dd MMMM yy';

export const ScheduleTab = ({technicianId}: Props) => {
  const [serviceOrderStatusColor] = useServiceOrderStatusColor();
  const [monthPair, setMonthPair] = useState<{[key: string]: Date}>({
    startOfMonthDay: startOfMonth(new Date()),
    endOfMonthDay: endOfMonth(new Date()),
  });
  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [page] = useState(makePage(0, 100));
  const {data: serviceOrders = createEmptyResource<ServiceOrderView>(10)} =
    useQueryServiceOrderSchedules({
      end: toRestDateTime(monthPair?.endOfMonthDay),
      start: toRestDateTime(monthPair?.startOfMonthDay),
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
        getMonthPair={(pair) => setMonthPair(pair)}
        scheduleItems={orders}
        renderCellItem={(order: ServiceOrderView, calWidth, calcPosition) => (
          <ScheduleItem
            key={`${order.id}`}
            titleLeftAdornment={
              <ServiceOrderIcons
                style={{fontSize: '5rem'}}
                serviceOrderType={order.type}
              />
            }
            title={order.elevator.propertyOwner.name}
            subtitle={order.elevator.propertyOwner.address.fullName}
            width={calWidth(
              order.schedules[0].startTime,
              order.schedules[0].endTime,
            )}
            cardStatusAccent={serviceOrderStatusColor[order.status]}
            position={calcPosition(order.schedules[0].startTime)}
          />
        )}
      />
    </>
  );
};
