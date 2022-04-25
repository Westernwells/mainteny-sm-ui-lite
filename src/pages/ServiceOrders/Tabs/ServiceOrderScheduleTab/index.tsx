import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {useQueryServiceOrderSchedules} from 'hooks/reactQuery/useServiceOrder';
import * as _ from 'lodash';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {toRestDateTime} from 'utils/datetime';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';

import {Schedule} from 'components/Schedules';
import {ScheduleItem} from 'components/Schedules/ScheduleItem';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {useServiceOrderStatusColor} from 'hooks/useServiceOrderStatusColor';
import {ServiceOrderStatusIndicator} from 'components/ServiceOrderStatusIndicator';

import {OrderDetails} from 'components/OrderDetails';
import {endOfDay, startOfDay} from 'date-fns';
import {TechnicianView} from 'models/technician';
import {useQueryServiceCompanyTechnicians} from 'hooks/reactQuery/useTechnician';
import {Progress} from 'components/Progress';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {capitalize} from 'lodash';

interface Props {
  searchQuery?: string;
  showFilter?: boolean;
  setShowFilter?: (val: boolean) => void;
}

export const ServiceOrderScheduleTab = ({
  searchQuery = '',
  showFilter = false,
  setShowFilter = () => {},
}: Props) => {
  const [serviceOrderStatusColor] = useServiceOrderStatusColor();
  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<
    ServiceOrderStatus[] | []
  >([]);
  const [page] = useState(makePage(0, 500));
  const {
    data: technicianResource = createEmptyResource<TechnicianView>(10),
    isLoading: technicianLoading,
  } = useQueryServiceCompanyTechnicians({
    pageIndex: 0,
    pageSize: 500,
    query: searchQuery,
  });
  const {
    data: serviceOrders = createEmptyResource<ServiceOrderView>(10),
    isLoading,
  } = useQueryServiceOrderSchedules({
    end: toRestDateTime(endOfDay(new Date())),
    start: toRestDateTime(startOfDay(new Date())),
    pageIndex: page.pageIndex,
    pageSize: page.pageSize,
    query: searchQuery,
    status: selectedOrderStatus,
  });

  useEffect(() => {
    const groupByTechnician = _.groupBy(
      serviceOrders.data,
      (serviceOrder) =>
        `${serviceOrder.schedules[0].technician.userAccount.firstName} ${serviceOrder.schedules[0].technician.userAccount.lastName}`,
    );
    setOrders(groupByTechnician);
  }, [serviceOrders]);

  const renderFilterItems = () => (
    <FilterFields showFilter={showFilter} setShowFilter={setShowFilter}>
      <MultipleSelectCheckmarks
        label="Status"
        options={Object.values(ServiceOrderStatus).map((option) =>
          capitalize(option).split('_').join(' '),
        )}
        getSelectedValue={(item) => {
          let orderStatus = item.map((val) =>
            val.split(' ').join('_').toUpperCase(),
          );
          if (orderStatus.includes(ServiceOrderStatus.ALL)) {
            orderStatus = [];
          }
          setSelectedOrderStatus(orderStatus as ServiceOrderStatus[]);
        }}
        multiple
      />
    </FilterFields>
  );

  return (
    <>
      <Box sx={{display: 'flex', justifyConteny: 'space-between'}}>
        {renderFilterItems()}
        <ServiceOrderStatusIndicator containerStyles={{flexGrow: 1}} />
      </Box>
      {isLoading || technicianLoading ? (
        <Progress />
      ) : (
        <Schedule
          scheduleItems={orders}
          labelType="people"
          headerLabelTitle={`Technicians (${technicianResource.total})`}
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
      )}
    </>
  );
};
