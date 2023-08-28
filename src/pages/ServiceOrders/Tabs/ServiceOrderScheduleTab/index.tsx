import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {
  useQueryServiceOrderScheduled,
  useServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {toRestDateTime} from 'utils/datetime';
import {
  ServiceOrderStatus,
  ServiceOrderType,
  ServiceOrderView,
  ServiceOrderOrderField,
} from 'models/service-order';
import {Order} from 'models/misc';
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
import {
  sortOrderByTime,
  getServiceOrderStatusList,
  getSelectedOrderStatuses,
  serviceOrderTypeToString,
  serviceOrderTypeToEnum,
} from 'utils/service-order-utils';
import Typography from '@mui/material/Typography';
import {useWhen} from 'hooks/useWhen';
import {UnAssignedServiceOrders} from './UnAssigedServiceOrder';

export const ServiceOrderScheduleTab = () => {
  const {t} = useTranslation();
  const getWhen = useWhen();
  const [serviceOrderStatusColor] = useServiceOrderStatusColor();
  const [technicianSearch, setTechnicianSearch] = useState('');
  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [switchActive, setSwitchActive] = useState(false);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<
    ServiceOrderStatus[] | []
  >([]);
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<
    ServiceOrderType[]
  >([]);
  const [page] = useState(makePage(0, 500));

  const {data: technicianResource = createEmptyResource<EmployeesView>(10)} =
    useQueryServiceCompanyTechnicians({
      pageIndex: 0,
      pageSize: 500,
      query: technicianSearch,
    });

  const {
    data: serviceOrders = createEmptyResource<ServiceOrderView>(10),
    isLoading,
  } = useQueryServiceOrderScheduled(
    {
      end: toRestDateTime(endOfDay(currentDate)),
      start: toRestDateTime(startOfDay(currentDate)),
      pageIndex: page.pageIndex,
      pageSize: page.pageSize,
      query: '',
      status: selectedOrderStatus,
      types: selectedOrderTypes,
    },
    {keepPreviousData: true},
  );

  const {
    data: unassignedServiceOrders = createEmptyResource<ServiceOrderView>(
      page.pageSize,
    ),
  } = useServiceOrders({
    end: endOfDay(addDays(new Date(), 180)).toISOString(),
    start: startOfDay(addDays(new Date(), -180)).toISOString(), // we should show unsassigned orders for a couople month
    pageSize: page.pageSize,
    pageIndex: page.pageIndex,
    query: '',
    status: [ServiceOrderStatus.READY_TO_SCHEDULE, ServiceOrderStatus.INIT],
    order: Order.ASC,
    orderBy: ServiceOrderOrderField.CREATED_TIME,
  });

  useEffect(() => {
    if (!isLoading) {
      const sortedOrder = sortOrderByTime(serviceOrders.data);
      let groupByTechnicianId: {[key: string]: ServiceOrderView[]} = {};

      sortedOrder.forEach((serviceOrder) => {
        serviceOrder.schedules.forEach((schedule) => {
          const technicianId = schedule.technician.id;
          const group = groupByTechnicianId[technicianId];
          if (!group) {
            groupByTechnicianId[technicianId] = [serviceOrder];
          } else {
            groupByTechnicianId = {
              ...groupByTechnicianId,
              [technicianId]: [...group, serviceOrder],
            };
          }
        });
      });
      setOrders(groupByTechnicianId);
    }
  }, [serviceOrders, isLoading]);

  const nextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const prevDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const getSelectedStatusValues = (items: string[]) => {
    const selectedOrderStatuses = getSelectedOrderStatuses(items, false);
    setSelectedOrderStatus(selectedOrderStatuses as ServiceOrderStatus[]);
  };

  const renderFilterItems = () => (
    <FilterFields
      onClear={() => {
        setSelectedOrderStatus([]);
        setSelectedOrderTypes([]);
      }}>
      <MultipleSelectCheckmarks
        label="Order Types"
        options={Object.keys(ServiceOrderType).map((i) =>
          serviceOrderTypeToString(i),
        )}
        initialSelectedItems={selectedOrderTypes}
        getSelectedValue={(item) => {
          const orderTypes = item.map((i) => serviceOrderTypeToEnum(i));
          setSelectedOrderTypes(orderTypes as ServiceOrderType[]);
        }}
        multiple
      />
      <MultipleSelectCheckmarks
        label="Status"
        options={getServiceOrderStatusList()}
        getSelectedValue={getSelectedStatusValues}
        initialSelectedItems={selectedOrderStatus}
        multiple
      />
    </FilterFields>
  );

  const renderWidget = () => (
    <Widget
      filterItems={renderFilterItems()}
      btnLabel="New Job"
      hideSearchInput
    />
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
        {t(`${getWhen(currentDate)}`)}
      </Typography>
      <Box onClick={() => nextDay()} sx={{cursor: 'pointer'}}>
        <ArrowForwardIosIcon sx={{fontSize: '0.8rem'}} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', mb: '0.5em'}}>
        <Box sx={{mr: '0.8em'}}>{renderControls()}</Box>
        {renderWidget()}
        <Box sx={{display: 'flex', justifyContent: 'flex-end', flexGrow: 1}}>
          <Switch
            getValue={(value) => setSwitchActive(value)}
            label={t(`Show Unassigned Orders ({{count}})`, {
              count: unassignedServiceOrders.total,
            })}
          />
        </Box>
      </Box>

      <Box sx={{display: 'flex', flexGrow: 1, height: 0}}>
        <Schedule
          currentDate={currentDate}
          containerStyles={{flexGrow: 1}}
          cardFooter={
            <ServiceOrderStatusIndicator containerStyles={{flexGrow: 1}} />
          }
          scheduleItems={orders}
          scheduleType="people"
          searchPlaceholder="e.g. Tobias"
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
