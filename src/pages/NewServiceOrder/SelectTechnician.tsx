import {useCallback, useEffect, useRef, useState} from 'react';
import Typography from '@mui/material/Typography';
import * as _ from 'lodash';
import {ServiceOrderView} from 'models/service-order';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {TechnicianView} from 'models/technician';
import {useFetchRecommendedTechnician} from 'hooks/reactQuery/useTechnician';
import {useQueryServiceOrderScheduled} from 'hooks/reactQuery/useServiceOrder';
import {endOfDay, startOfDay} from 'date-fns';
import {toRestDateTime} from 'utils/datetime';
import {Schedule} from 'components/Schedules';
import {ScheduleItem} from 'components/Schedules/ScheduleItem';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {OrderDetails} from 'components/OrderDetails';
import {useServiceOrderStatusColor} from 'hooks/useServiceOrderStatusColor';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {AddTechnicianDialog} from './AddTechnicianDialog';

interface Props {
  elevatorId?: string;
  initialSelectedTechnicians: TechnicianView[];
  getSelectedTechnicians?: (val: TechnicianView[]) => void;
  getRecommendedTechnicianView?: (val: TechnicianView[]) => void;
  initialRecommendedTechnicians: TechnicianView[];
}

interface CheckBoxState {
  checked: boolean;
  value: string;
}

export const SelectTechnician = ({
  elevatorId,
  getSelectedTechnicians,
  getRecommendedTechnicianView,
  initialRecommendedTechnicians,
  initialSelectedTechnicians,
}: Props) => {
  const time = useRef(toRestDateTime(new Date())).current;
  const [serviceOrderStatusColor] = useServiceOrderStatusColor();
  const [openDialog, setOpenDialog] = useState(false);

  const [newTechnician, setNewTechnician] = useState<TechnicianView | null>(
    null,
  );
  const [checkboxState, setCheckboxState] = useState<CheckBoxState>(
    {} as CheckBoxState,
  );
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>(
    [],
  );

  const [orders, setOrders] = useState<{[key: string]: ServiceOrderView[]}>({});
  const [page] = useState(makePage(0, 500));
  const [recommendedTechniciansView, setRecommendedTechniciansView] = useState<
    TechnicianView[]
  >(initialRecommendedTechnicians);
  const {data: recommendedTechnicians = []} = useFetchRecommendedTechnician(
    {
      time,
      count: 4,
    },
    elevatorId,
  );
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
    if (getRecommendedTechnicianView) {
      getRecommendedTechnicianView(recommendedTechniciansView);
    }
  }, [recommendedTechniciansView]);

  useEffect(() => {
    setSelectedTechnicianIds(initialSelectedTechnicians.map((item) => item.id));
  }, []);

  useEffect(() => {
    if (getSelectedTechnicians) {
      const result = recommendedTechniciansView.filter((item) =>
        selectedTechnicianIds.includes(item.id),
      );
      getSelectedTechnicians(result);
    }
  }, [selectedTechnicianIds]);

  useEffect(() => {
    const groupByTechnicianId = _.groupBy(
      serviceOrders.data,
      (serviceOrder) => serviceOrder.schedules[0].technician.id,
    );
    setOrders(groupByTechnicianId);
  }, [serviceOrders]);

  useEffect(() => {
    const ids = recommendedTechnicians.map((item) => item.id);
    const result = recommendedTechniciansView.filter(
      (item) => !ids.includes(item.id),
    );

    setRecommendedTechniciansView([...recommendedTechnicians, ...result]);
  }, [recommendedTechnicians]);

  useEffect(() => {
    if (newTechnician) {
      const technicianExist = recommendedTechniciansView.filter(
        (item) => item.id === newTechnician.id,
      );
      if (!technicianExist.length) {
        setRecommendedTechniciansView([
          ...recommendedTechniciansView,
          newTechnician,
        ]);
      }
    }
  }, [newTechnician]);

  useEffect(() => {
    if (!Object.keys(checkboxState).length) return;
    if (!selectedTechnicianIds.includes(checkboxState.value)) {
      setSelectedTechnicianIds([...selectedTechnicianIds, checkboxState.value]);
    } else {
      setSelectedTechnicianIds(
        selectedTechnicianIds.filter((item) => item !== checkboxState.value),
      );
    }
  }, [checkboxState]);

  const getCheckedValue = useCallback(
    (checked, value) => setCheckboxState({checked, value}),
    [],
  );

  return (
    <>
      <Schedule
        customCardHeader={
          <Box sx={{}}>
            <Typography sx={{}} variant="h6">
              Choose Technicians
            </Typography>
            <Typography variant="body1" component="div" color="text.secondary">
              Selected technicians below will be contacted by phone
              automatically
            </Typography>
          </Box>
        }
        containerStyles={{
          boxShadow: 'none',
          border: 'none',
        }}
        footerContainerStyles={{
          flexGrow: 1,
        }}
        cardFooter={
          <Box sx={{ml: '1.5em'}}>
            <Button
              variant="outlined"
              sx={{bgcolor: 'white'}}
              onClick={() => setOpenDialog(true)}>
              Add More
            </Button>
          </Box>
        }
        cellHeight="50px"
        scheduleItems={orders}
        makeLabelSelectable
        getCheckedValue={getCheckedValue}
        defaultTypeLabel="Recommended Technician"
        labelWidth="15rem"
        technicians={recommendedTechniciansView}
        checkedValues={selectedTechnicianIds}
        renderCellItem={(order: ServiceOrderView, calWidth, calcPosition) => (
          <ScheduleItem
            key={order.id}
            height="30px"
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
      <AddTechnicianDialog
        open={openDialog}
        getDialogState={(state) => setOpenDialog(state)}
        getTechnician={(item) => setNewTechnician(item)}
      />
    </>
  );
};
