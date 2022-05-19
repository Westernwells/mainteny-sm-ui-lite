/* eslint-disable */
import {useEffect, useState} from 'react';
import Typography from '@mui/material/Typography';
import {PageCard} from 'components/PageCard';
import * as _ from 'lodash';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {TechnicianView} from 'models/technician';
import {
  useFetchRecommendedTechnician,
  useQueryServiceCompanyTechnicians,
} from 'hooks/reactQuery/useTechnician';
import {useQueryServiceOrderScheduled} from 'hooks/reactQuery/useServiceOrder';
import {endOfDay, startOfDay} from 'date-fns';
import {toRestDateTime} from 'utils/datetime';
import {Schedule} from 'components/Schedules';
import {ScheduleItem} from 'components/Schedules/ScheduleItem';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {OrderDetails} from 'components/OrderDetails';
import {useServiceOrderStatusColor} from 'hooks/useServiceOrderStatusColor';
import {RecommendedTechnicianSchedule} from './RecommendedTechnicianSchedule';
import Box from '@mui/material/Box';

export const SelectTechnician = () => {
  const [serviceOrderStatusColor] = useServiceOrderStatusColor();
  const [technicianSearch, setTechnicianSearch] = useState('');
  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [page] = useState(makePage(0, 500));
  const {data: recommendedTechnician = []} = useFetchRecommendedTechnician({
    time: toRestDateTime(new Date()),
    count: 4,
  });
  const {data: serviceOrders = createEmptyResource<ServiceOrderView>(5)} =
    useQueryServiceOrderScheduled({
      end: toRestDateTime(endOfDay(new Date())),
      start: toRestDateTime(startOfDay(new Date())),
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: '',
      status: [],
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
      <>
        <Typography sx={{}} variant="h6">
          Choose Technicians
        </Typography>
        <Typography variant="body1" component="div" color="text.secondary">
          Selected technicians below will be contacted by phone automatically
        </Typography>
      </>
      <Schedule
        containerStyles={{mt: '2em'}}
        scheduleItems={orders}
        defaultTypeLabel='Recommended Technician'
        handleSearch={(value) => setTechnicianSearch(value)}
        bodyLabel={recommendedTechnician.map(
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
