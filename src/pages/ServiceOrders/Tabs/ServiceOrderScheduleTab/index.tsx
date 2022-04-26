import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {useQueryServiceOrderSchedules} from 'hooks/reactQuery/useServiceOrder';
import * as _ from 'lodash';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {getWhen, toRestDateTime} from 'utils/datetime';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';

import {Schedule} from 'components/Schedules';
import {ScheduleItem} from 'components/Schedules/ScheduleItem';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {useServiceOrderStatusColor} from 'hooks/useServiceOrderStatusColor';

import {OrderDetails} from 'components/OrderDetails';
import {addDays, endOfDay, startOfDay, subDays} from 'date-fns';
import {TechnicianView} from 'models/technician';
import {useQueryServiceCompanyTechnicians} from 'hooks/reactQuery/useTechnician';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {capitalize} from 'lodash';
import {Switch} from 'components/Switch';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Typography from '@mui/material/Typography';

interface Props {
  showFilter?: boolean;
  setShowFilter?: (val: boolean) => void;
}

export const ServiceOrderScheduleTab = ({
  showFilter = false,
  setShowFilter = () => {},
}: Props) => {
  const [serviceOrderStatusColor] = useServiceOrderStatusColor();
  const [technicianSearch, setTechnicianSearch] = useState('');
  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [currentDate, setCurrentDate] = useState(new Date());
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
    query: technicianSearch,
  });
  const {data: serviceOrders = createEmptyResource<ServiceOrderView>(10)} =
    useQueryServiceOrderSchedules({
      end: toRestDateTime(endOfDay(currentDate)),
      start: toRestDateTime(startOfDay(currentDate)),
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: '',
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

  const nextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const prevDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const renderFilterItems = () => (
    <FilterFields
      showFilter={showFilter}
      setShowFilter={setShowFilter}
      hideClear>
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

  const renderControls = () => (
    <Box
      sx={{
        display: 'flex',
        background: '#fff',
        py: '0.5em',
        px: '1em',
        minWidth: '10rem',
        justifyContent: 'space-between',
      }}>
      <Box onClick={() => prevDay()} sx={{cursor: 'pointer'}}>
        <ArrowBackIosIcon sx={{fontSize: '0.8rem'}} />
      </Box>
      <Typography variant="tableHeaderText" ml="0.5em" mr="0.9em">
        {getWhen(currentDate, 'dd.MM.yyyy')}
      </Typography>
      <Box onClick={() => nextDay()} sx={{cursor: 'pointer'}}>
        <ArrowForwardIosIcon sx={{fontSize: '0.8rem'}} />
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{display: 'flex', justifyContent: 'space-between', mb: '0.5em'}}>
        <Box>{renderControls()}</Box>
        <Box sx={{display: 'flex', justifyContent: 'flex-end', flexGrow: 1}}>
          {renderFilterItems()}
          <Switch label="Show Unassigned Orders" />
        </Box>
        {/* <ServiceOrderStatusIndicator containerStyles={{flexGrow: 1}} /> TODO: ADD to card footer */}
      </Box>

      <Schedule
        scheduleItems={orders}
        loading={technicianLoading}
        labelType="people"
        searchPlaceholder="Search technician"
        handleSearch={(value) => setTechnicianSearch(value)}
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
