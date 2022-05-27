import {useCallback, useEffect, useRef, useState} from 'react';
import Typography from '@mui/material/Typography';
import * as _ from 'lodash';
import {ServiceOrderType, ServiceOrderView} from 'models/service-order';
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
import RadioGroup from '@mui/material/RadioGroup';
import useTheme from '@mui/material/styles/useTheme';
import Divider from '@mui/material/Divider';
import {Button} from 'components/Button';
import {sortOrderByTime} from 'utils/service-order-utils';
import {AddTechnicianDialog} from './AddTechnicianDialog';
import {TechnicianSchedule} from './TechnicianSchedule';
import {ContainerCard} from './ContainerCard';
import {ScheduleForm} from './ScheduleForm';
import {DueDateFormProps, RadioOptions, ScheduleTechnicianForm} from './models';
import {DueDateForm} from './DueDateForm';

interface Props {
  elevatorId?: string;
  initialSelectedTechnicians?: TechnicianView[];
  getSelectedTechnicians?: (val: TechnicianView[]) => void;
  getRecommendedTechnicianView?: (val: TechnicianView[]) => void;
  initialRecommendedTechnicians?: TechnicianView[];
  showOptions?: boolean;
  defaultOption?: RadioOptions;
  getScheduleFormValue?: (form: ScheduleTechnicianForm) => void;
  getDueDateFormValues?: (form: DueDateFormProps) => void;
  scheduleFormIsErrored?: (value: boolean) => void;
  dueDateFormIsErrored?: (value: boolean) => void;
  getSelectedRadioOption?: (val?: RadioOptions) => void;
  type?: Exclude<ServiceOrderType, ServiceOrderType.EMERGENCY>;
}

interface CheckBoxState {
  checked: boolean;
  value: string;
}

const otherOptions = [
  {
    value: RadioOptions.DUE_DATE,
    label: 'Select a due date',
    subText: `Select a date before which this service order has to be completed`,
  },
  {
    value: RadioOptions.SCHEDULE_TECHNICIAN,
    label: 'Choose a Date, Time & Technician',
    subText: `Select a specific date, time and technician and update the
    technician&apos;s schedule for that day`,
  },
];

const calloutOptions = [
  {
    value: RadioOptions.IMMEDIATE,
    label: 'Immediate',
    subText:
      ' Select a technician for attending this service order immediately',
  },
  ...otherOptions,
];

export const SelectTechnicians = ({
  elevatorId,
  getSelectedTechnicians,
  getRecommendedTechnicianView,
  initialRecommendedTechnicians,
  initialSelectedTechnicians,
  showOptions,
  defaultOption,
  type,
  getScheduleFormValue = () => {},
  getDueDateFormValues = () => {},
  scheduleFormIsErrored,
  dueDateFormIsErrored,
  getSelectedRadioOption,
}: Props) => {
  const theme = useTheme();
  const options = useRef(
    type === ServiceOrderType.CALLOUT ? calloutOptions : otherOptions,
  ).current;
  const time = useRef(toRestDateTime(new Date())).current;
  const [selectedOption, setSelectedOption] = useState<
    RadioOptions | undefined
  >(defaultOption);
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
  >(initialRecommendedTechnicians || []);
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
    setSelectedTechnicianIds(
      initialSelectedTechnicians
        ? initialSelectedTechnicians.map((item) => item.id)
        : [],
    );
  }, []);

  useEffect(() => {
    if (getSelectedTechnicians) {
      if (selectedOption === RadioOptions.IMMEDIATE) {
        const result = recommendedTechniciansView.filter((item) =>
          selectedTechnicianIds.includes(item.id),
        );

        getSelectedTechnicians(result);
      }
    }
  }, [selectedTechnicianIds]);

  useEffect(() => {
    const sortedOrder = sortOrderByTime(serviceOrders.data);
    const groupByTechnicianId = _.groupBy(
      sortedOrder,
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
    if (getSelectedRadioOption) {
      getSelectedRadioOption(selectedOption);
    }
  }, [selectedOption]);

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

  const cardHeader = () => (
    <Box sx={{}}>
      {showOptions ? (
        <>
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
                    checked={selectedOption === option.value}
                    handleChange={(e) => {
                      setSelectedOption(e.target.value as RadioOptions);
                      setSelectedTechnicianIds([]);
                      if (getSelectedTechnicians) {
                        getSelectedTechnicians([]);
                      }
                    }}
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
          <Divider sx={{mt: '1.5em'}} />
        </>
      ) : null}

      {selectedOption === RadioOptions.IMMEDIATE ? (
        <>
          <Typography variant="h6" sx={{mt: showOptions ? '2em' : undefined}}>
            Choose Technicians
          </Typography>
          <Typography variant="body1" component="div" color="text.secondary">
            Selected technicians below will be contacted by phone automatically
          </Typography>
        </>
      ) : null}
    </Box>
  );

  const renderCellItem = (
    order: ServiceOrderView,
    width: string,
    position: {x: string; y: string},
  ) => (
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
      width={width}
      tooltip={<OrderDetails order={order} />}
      cardStatusAccent={serviceOrderStatusColor[order.status]}
      position={position}
    />
  );

  return (
    <>
      <ContainerCard
        customCardHeader={cardHeader()}
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
          selectedOption === RadioOptions.IMMEDIATE ? (
            <Box sx={{ml: '1.5em'}}>
              <Button
                label="Add More"
                buttonProps={{
                  variant: 'outlined',
                  sx: {bgcolor: 'white'},
                  onClick: () => setOpenDialog(true),
                }}
              />
            </Box>
          ) : null
        }>
        {selectedOption === RadioOptions.IMMEDIATE ? (
          <TechnicianSchedule
            scheduleItems={orders}
            renderCellItem={renderCellItem}
            defaultTypeLabel="Recommended Technician"
            labelWidth="15rem"
            getCheckedValue={getCheckedValue}
            cellHeight="50px"
            technicians={recommendedTechniciansView}
            checkedValues={selectedTechnicianIds}
          />
        ) : null}

        {selectedOption === RadioOptions.DUE_DATE ? (
          <DueDateForm
            defaultStartDate={null}
            getDueDateFormValues={(form: DueDateFormProps) =>
              getDueDateFormValues(form)
            }
            dueDateFormIsErrored={(val: boolean) =>
              dueDateFormIsErrored && dueDateFormIsErrored(val)
            }
            containerStyles={{pl: '1em', mt: '2em', maxWidth: '30%'}} // containerStyles,
          />
        ) : null}
        {selectedOption === RadioOptions.SCHEDULE_TECHNICIAN ? (
          <ScheduleForm
            containerStyles={{pl: '1em', mt: '2em', maxWidth: '30%'}}
            defaultEndDate={null}
            currentRadioOption={selectedOption}
            defaultStartDate={null}
            defaultTechnician={null}
            scheduleFormIsErrored={(val) =>
              scheduleFormIsErrored && scheduleFormIsErrored(val)
            }
            getTechnician={(val) => {
              if (getSelectedTechnicians && val) {
                getSelectedTechnicians([val]);
              }
            }}
            getScheduleFormValues={(form: ScheduleTechnicianForm) => {
              getScheduleFormValue(form);
              if (form.technicianId) {
                setSelectedTechnicianIds([form.technicianId]);
              } else {
                setSelectedTechnicianIds([]);
              }
            }}
          />
        ) : null}
      </ContainerCard>

      <AddTechnicianDialog
        open={openDialog}
        getDialogState={(state) => setOpenDialog(state)}
        getTechnician={(item) => setNewTechnician(item)}
      />
    </>
  );
};
