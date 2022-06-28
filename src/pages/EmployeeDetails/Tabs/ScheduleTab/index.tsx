import {useEffect, useState} from 'react';
import {useQueryServiceOrderScheduled} from 'hooks/reactQuery/useServiceOrder';
import * as _ from 'lodash';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {
  formatDate,
  getDateObject,
  getEndOfWeek,
  getStartOfWeek,
  toRestDateTime,
} from 'utils/datetime';
import {ServiceOrderView} from 'models/service-order';

import {Schedule} from 'components/Schedules';
import {ScheduleItem} from 'components/Schedules/ScheduleItem';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {useServiceOrderStatusColor} from 'hooks/useServiceOrderStatusColor';
import {ServiceOrderStatusIndicator} from 'components/ServiceOrderStatusIndicator';
import {WeekPair} from 'models/misc';
import {OrderDetails} from 'components/OrderDetails';
import {FlexContainer} from 'components/FlexContainer';
import {sortOrderByTime} from 'utils/service-order-utils';

interface Props {
  technicianId?: string;
}

const dateFormat = 'dd MMMM yy';

export const ScheduleTab = ({technicianId}: Props) => {
  const [serviceOrderStatusColor] = useServiceOrderStatusColor();
  const [weekPair, setWeekPair] = useState<WeekPair>({
    startOfWeekDay: getStartOfWeek(new Date(), 1),
    endOfWeekDay: getEndOfWeek(new Date(), 1),
  });

  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [page] = useState(makePage(0, 100));
  const {data: serviceOrders = createEmptyResource<ServiceOrderView>(10)} =
    useQueryServiceOrderScheduled(
      {
        end: toRestDateTime(weekPair?.endOfWeekDay),
        start: toRestDateTime(weekPair?.startOfWeekDay),
        pageIndex: page.pageIndex,
        pageSize: page.pageSize,
        query: '',
        technicianIds: technicianId ? [technicianId] : [],
      },
      {keepPreviousData: true},
    );

  useEffect(() => {
    const sortedOrder = sortOrderByTime(serviceOrders.data);
    const ordersByDate = _.groupBy(sortedOrder, (serviceOrder) =>
      formatDate(
        getDateObject(serviceOrder.schedules[0].startTime),
        dateFormat,
      ),
    );

    setOrders(ordersByDate);
  }, [serviceOrders]);

  return (
    <FlexContainer containerStyle={{height: 0}}>
      <ServiceOrderStatusIndicator />
      <Schedule
        getWeekPair={(pair) => setWeekPair(pair)}
        scheduleItems={orders}
        scheduleType="date"
        renderCellItem={(order: ServiceOrderView, width, position) => (
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
            width={width}
            tooltip={OrderDetails}
            order={order}
            cardStatusAccent={serviceOrderStatusColor[order.status]}
            position={position}
          />
        )}
      />
    </FlexContainer>
  );
};
