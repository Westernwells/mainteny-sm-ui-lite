import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {useQueryServiceOrderScheduled} from 'hooks/reactQuery/useServiceOrder';
import * as _ from 'lodash';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {getWhen, toRestDateTime} from 'utils/datetime';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';

import {Schedule} from 'components/Schedules';
import {ScheduleItem} from 'components/Schedules/ScheduleItem';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {useServiceOrderStatusColor} from 'hooks/useServiceOrderStatusColor';

import {OrderDetails} from 'components/OrderDetails';
import {useTranslation} from 'react-i18next';
import {addDays, endOfDay, startOfDay, subDays} from 'date-fns';
import {useQueryServiceCompanyTechnicians} from 'hooks/reactQuery/useTechnician';
import {FilterFields} from 'components/FilterFields';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {Switch} from 'components/Switch';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import {EmployeesView} from 'models/employee';
import {ServiceOrderStatusIndicator} from 'components/ServiceOrderStatusIndicator';
import {Widget} from 'components/Widget';
import {sortOrderByTime} from 'utils/service-order-utils';
import Typography from '@mui/material/Typography';
import {UnAssignedServiceOrders} from './UnAssigedServiceOrder';

export const ServiceOrderScheduleTab = () => {
  const [serviceOrderStatusColor] = useServiceOrderStatusColor();
  const [technicianSearch, setTechnicianSearch] = useState('');
  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [switchActive, setSwitchActive] = useState(false);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<
    ServiceOrderStatus[] | []
  >([]);
  const [page] = useState(makePage(0, 500));
  const {data: technicianResource = createEmptyResource<EmployeesView>(10)} =
    useQueryServiceCompanyTechnicians({
      pageIndex: 0,
      pageSize: 500,
      query: technicianSearch,
    });
  const {data: serviceOrders = createEmptyResource<ServiceOrderView>(10)} =
    useQueryServiceOrderScheduled(
      {
        end: toRestDateTime(endOfDay(currentDate)),
        start: toRestDateTime(startOfDay(currentDate)),
        pageIndex: page.pageIndex,
        pageSize: page.pageSize,
        query: '',
        status: selectedOrderStatus,
      },
      {keepPreviousData: true},
    );

  useEffect(() => {
    const sortedOrder = sortOrderByTime(serviceOrders.data);
    const groupByTechnicianId = _.groupBy(
      sortedOrder,
      (serviceOrder) => serviceOrder.schedules[0].technician.id,
    );
    setOrders(groupByTechnicianId);
  }, [serviceOrders]);

  const nextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const prevDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const renderFilterItems = () => (
    <FilterFields hideClear>
      <MultipleSelectCheckmarks
        label="Status"
        options={Object.values(ServiceOrderStatus).map((option) =>
          _.capitalize(option).split('_').join(' '),
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

  const renderWidget = () => (
    <Widget
      filterItems={renderFilterItems()}
      btnLabel="New Order"
      hideSearchInput
    />
  );

  const renderControls = () => {
    const {t} = useTranslation();
    return (
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
          {t(`${getWhen(currentDate, 'dd.MM.yyyy')}`)}
        </Typography>
        <Box onClick={() => nextDay()} sx={{cursor: 'pointer'}}>
          <ArrowForwardIosIcon sx={{fontSize: '0.8rem'}} />
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', mb: '0.5em'}}>
        <Box sx={{mr: '0.8em'}}>{renderControls()}</Box>
        {renderWidget()}
        <Box sx={{display: 'flex', justifyContent: 'flex-end', flexGrow: 1}}>
          <Switch
            getValue={(value) => setSwitchActive(value)}
            label="Show Unassigned Orders"
          />
        </Box>
      </Box>

      <Box sx={{display: 'flex', flexGrow: 1, height: 0}}>
        <Schedule
          containerStyles={{flexGrow: 1}}
          cardFooter={
            <ServiceOrderStatusIndicator containerStyles={{flexGrow: 1}} />
          }
          scheduleItems={orders}
          scheduleType="people"
          searchPlaceholder="Search technician"
          handleSearch={(value) => setTechnicianSearch(value)}
          technicians={technicianResource.data}
          labelWidth="14rem"
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
        {switchActive ? (
          <UnAssignedServiceOrders
            containerStyles={{width: '100%', ml: '0.5em'}}
          />
        ) : null}
      </Box>
    </Box>
  );
};
