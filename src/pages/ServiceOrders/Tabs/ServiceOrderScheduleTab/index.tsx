import {useEffect, useState} from 'react';
import {useQueryServiceOrderSchedules} from 'hooks/reactQuery/useServiceOrder';
import * as _ from 'lodash';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {toRestDateTime} from 'utils/datetime';
import {ServiceOrderView} from 'models/service-order';

import {Schedule} from 'components/Schedules';
import {ScheduleItem} from 'components/Schedules/ScheduleItem';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {useServiceOrderStatusColor} from 'hooks/useServiceOrderStatusColor';
import {ServiceOrderStatusIndicator} from 'components/ServiceOrderStatusIndicator';

import {OrderDetails} from 'components/OrderDetails';
import {endOfDay, startOfDay, subDays} from 'date-fns';
import {TechnicianView} from 'models/technician';
import {useQueryServiceCompanyTechnicians} from 'hooks/reactQuery/useTechnician';

export const ServiceOrderScheduleTab = () => {
  const [serviceOrderStatusColor] = useServiceOrderStatusColor();
  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [page] = useState(makePage(0, 500));
  const {data: technicianResource = createEmptyResource<TechnicianView>(10)} =
    useQueryServiceCompanyTechnicians({
      pageIndex: 0,
      pageSize: 500,
      query: '',
    });
  const {data: serviceOrders = createEmptyResource<ServiceOrderView>(10)} =
    useQueryServiceOrderSchedules({
      end: toRestDateTime(subDays(endOfDay(new Date()), 2)),
      start: toRestDateTime(subDays(startOfDay(new Date()), 2)),
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: '',
    });

  useEffect(() => {
    const groupByTechnician = _.groupBy(
      serviceOrders.data,
      (serviceOrder) =>
        `${serviceOrder.schedules[0].technician.userAccount.firstName} ${serviceOrder.schedules[0].technician.userAccount.lastName}`,
    );
    setOrders(groupByTechnician);
  }, [serviceOrders]);

  return (
    <>
      <ServiceOrderStatusIndicator />
      <Schedule
        scheduleItems={orders}
        labelType="people"
        headerLabelTitle={`Technicians(${technicianResource.total})`}
        bodyLabel={technicianResource.data.map(
          (technician) =>
            `${technician.userAccount.firstName} ${technician.userAccount.lastName}`,
        )}
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
