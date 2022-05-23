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
import {ScheduleItem} from 'components/Schedules/ScheduleItem';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {OrderDetails} from 'components/OrderDetails';
import {useServiceOrderStatusColor} from 'hooks/useServiceOrderStatusColor';
import Box from '@mui/material/Box';
import {FormRadio} from 'components/form/FormRadio';
import Button from '@mui/material/Button';
import RadioGroup from '@mui/material/RadioGroup';
import useTheme from '@mui/material/styles/useTheme';
import {AddTechnicianDialog} from './AddTechnicianDialog';
import {RecommendedTechnicianSchedule} from './RecommendedTechnicianSchedule';

interface Props {
  elevatorId?: string;
  initialSelectedTechnicians: TechnicianView[];
  getSelectedTechnicians?: (val: TechnicianView[]) => void;
  getRecommendedTechnicianView?: (val: TechnicianView[]) => void;
  initialRecommendedTechnicians: TechnicianView[];
  showOptions?: boolean;
  defaultOption?: string;
}

interface CheckBoxState {
  checked: boolean;
  value: string;
}

const constant = {
  IMMEDIATE: 'immediate',
  TIMEANDTECHNICIAN: 'timeAndTechnician',
};

const options = [
  {
    value: constant.IMMEDIATE,
    label: 'Immediate',
    subText:
      ' Select a technician for attending this service order immediately',
  },
  {
    value: constant.TIMEANDTECHNICIAN,
    label: 'Choose a Date, Time & Technician',
    subText: `Select a specific date, time and technician and update the
    technician&apos;s schedule for that day`,
  },
];

export const SelectTechnician = ({
  elevatorId,
  getSelectedTechnicians,
  getRecommendedTechnicianView,
  initialRecommendedTechnicians,
  initialSelectedTechnicians,
  showOptions,
  defaultOption = '',
}: Props) => {
  const theme = useTheme();
  const time = useRef(toRestDateTime(new Date())).current;
  const [selectedOptions, setSelectedOptions] = useState<string>(defaultOption);
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
      <RecommendedTechnicianSchedule
        customCardHeader={
          <Box sx={{}}>
            {showOptions ? (
              <RadioGroup name="radio-buttons-group">
                <Box sx={{display: 'flex'}}>
                  {options.map((option) => (
                    <Box
                      key={option.label}
                      sx={{
                        width: '32%',
                        mr: '1em',
                        px: '1em',
                        border: `1px solid ${theme.palette.primary.outlinedHoverBg}`,
                        borderRadius: 2,
                      }}>
                      <FormRadio
                        value={option.value}
                        handleChange={(e) => setSelectedOptions(e.target.value)}
                        label={option.label}
                        radioProps={{
                          sx: {color: theme.palette.text.secondary},
                        }}
                      />
                      <Typography variant="body1" color="text.secondary">
                        {option.subText}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </RadioGroup>
            ) : null}

            {selectedOptions === constant.IMMEDIATE ? (
              <>
                <Typography
                  variant="h6"
                  sx={{mt: showOptions ? '2em' : undefined}}>
                  Choose Technicians
                </Typography>
                <Typography
                  variant="body1"
                  component="div"
                  color="text.secondary">
                  Selected technicians below will be contacted by phone
                  automatically
                </Typography>
              </>
            ) : null}
          </Box>
        }
        containerStyles={{
          boxShadow: 'none',
          border: 'none',
          flexGrow: 1,
          height: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
        contentContainerStyle={{flexGrow: 1, height: 0}}
        footerContainerStyles={{
          flexGrow: 1,
        }}
        cardFooter={
          selectedOptions === constant.IMMEDIATE ? (
            <Box sx={{ml: '1.5em'}}>
              <Button
                variant="outlined"
                sx={{bgcolor: 'white'}}
                onClick={() => setOpenDialog(true)}>
                Add More
              </Button>
            </Box>
          ) : null
        }
        cellHeight="50px"
        scheduleItems={orders}
        hideSchedule={selectedOptions !== constant.IMMEDIATE}
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
