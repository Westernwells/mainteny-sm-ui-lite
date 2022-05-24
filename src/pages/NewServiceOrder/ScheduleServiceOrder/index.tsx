import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {
  useAssignmentBasedOrder,
  useCreateScheduledServiceOrder,
} from 'hooks/reactQuery/useServiceOrder';
import {ElevatorView} from 'models/elevator';
import {TechnicianView} from 'models/technician';
import {useEffect, useState} from 'react';
import {ServiceOrderPriority, ServiceOrderType} from 'models/service-order';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {formatDate, setDateTime, toRestDateTime} from 'utils/datetime';
import {useNavigate} from 'react-router';
import {AddDescription} from '../AddDescription';
import {SelectTechnicians} from '../SelectTechnicians';
import {SelectUnit} from '../SelectUnit';
import {
  DueDateFormProps,
  RadioOptions,
  ScheduleTechnicianForm,
} from '../models';

const steps = [
  'Select unit',
  'Select, date, time & technician',
  'Add description',
];

interface Props {
  type: Exclude<ServiceOrderType, ServiceOrderType.EMERGENCY>;
}

export const ScheduleServiceOrder = ({type}: Props) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<ElevatorView>();
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  const [selectedDateString, setSelectedDateString] = useState<string>();
  const [selectedTimeString, setSelectedTimeString] = useState<string>();
  const [selectedRadioOption, setSelectedRadioOption] =
    useState<RadioOptions>();
  const {user} = useUserSession();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [scheduleFormValue, setScheduleFormValue] =
    useState<ScheduleTechnicianForm | null>(null);
  const [dueFormValue, setDueFormValue] = useState<DueDateFormProps | null>(
    null,
  );
  const [scheduleFormErrored, setScheduleFormErrored] =
    useState<boolean>(false);
  const [dueFormErrored, setDueFormErrored] = useState<boolean>(false);
  const {mutateAsync: createImmediateCalloutOrder} = useAssignmentBasedOrder(
    'Order created successfully',
  );

  const {mutateAsync: createScheduledServiceOrder} =
    useCreateScheduledServiceOrder('Order scheduled successfully');

  const [recommendedTechnicians, setRecommendedTechnicians] = useState<
    TechnicianView[]
  >([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<
    TechnicianView[]
  >([]);

  useEffect(() => {
    if (activeStep === 0 && !selectedUnit) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 1 && !selectedRadioOption) {
      return setDisableNextBtn(true);
    }

    if (
      activeStep === 1 &&
      selectedRadioOption === RadioOptions.IMMEDIATE &&
      !selectedTechnicians.length
    ) {
      return setDisableNextBtn(true);
    }

    if (
      activeStep === 1 &&
      selectedRadioOption === RadioOptions.DUE_DATE &&
      dueFormErrored
    ) {
      return setDisableNextBtn(true);
    }

    if (
      activeStep === 1 &&
      selectedRadioOption === RadioOptions.SCHEDULE_TECHNICIAN &&
      scheduleFormErrored
    ) {
      return setDisableNextBtn(true);
    }

    return setDisableNextBtn(false);
  }, [
    activeStep,
    selectedUnit,
    selectedTechnicians,
    scheduleFormErrored,
    dueFormErrored,
  ]);

  useEffect(() => {
    let dateString;
    let timeString;
    if (selectedRadioOption === RadioOptions.DUE_DATE) {
      dateString = formatDate(dueFormValue?.date!, 'dd.MM.yyy');
    }
    if (selectedRadioOption === RadioOptions.SCHEDULE_TECHNICIAN) {
      dateString = formatDate(scheduleFormValue?.date!, 'dd.MM.yyy');
      timeString = `${formatDate(
        scheduleFormValue?.startTime!,
        'HH:mm',
      )}-${formatDate(scheduleFormValue?.startTime!, 'HH:mm')}`;
    }
    setSelectedDateString(dateString);
    setSelectedTimeString(timeString);
  }, [scheduleFormValue, dueFormValue]);

  const handleCancel = () => {
    setActiveStep(0);
    setSelectedUnit(undefined);
    setRecommendedTechnicians([]);
    setSelectedTechnicians([]);
    setDescription('');
  };

  const createNewImmediateCalloutOrder = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id!;
    const body = {
      description,
      elevatorId: selectedUnit!.id,
      externalId: '',
      priority: ServiceOrderPriority.A,
      serviceCompanyId,
      technicianIds: selectedTechnicians.map((item) => item.id),
      time: toRestDateTime(new Date()),
      type,
    };
    await createImmediateCalloutOrder(body);
    navigate('/orders?pageIndex=1&pageSize=25&tab=1');
  };

  const createScheduledOrder = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id!;
    const startTime = setDateTime(
      scheduleFormValue!.date!,
      formatDate(scheduleFormValue!.startTime!, 'HH:mm')!,
    ).toISOString();
    const endTime = setDateTime(
      scheduleFormValue!.date!,
      formatDate(scheduleFormValue!.endTime!, 'HH:mm')!,
    ).toISOString();
    const body = {
      description,
      elevatorId: selectedUnit!.id,
      externalId: '',
      priority: ServiceOrderPriority.A,
      serviceCompanyId,
      technicianIds: selectedTechnicians.map((item) => item.id),
      type,
      requireReschedule: true,
      requireTechnicianNotification: true,
      startTime,
      endTime,
    };

    await createScheduledServiceOrder(body);
    navigate('/orders?pageIndex=1&pageSize=25&tab=1');
  };

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={async () => {
        if (selectedRadioOption === RadioOptions.IMMEDIATE) {
          await createNewImmediateCalloutOrder();
        } else {
          await createScheduledOrder();
        }
      }}
      disableNextBtn={disableNextBtn}
      getActiveStep={(val) => setActiveStep(val)}
      steps={steps}
      containerStyles={{
        mt: '3em',
        flexGrow: 1,
        ml: '0',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <FlexContainer>
        {activeStep === 0 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <SelectUnit
              getSelectedUnit={(val) => setSelectedUnit(val)}
              initialSelectedUnit={selectedUnit}
            />
          </FlexContainer>
        ) : null}
        {activeStep === 1 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <SelectTechnicians
              showOptions
              type={type}
              elevatorId={selectedUnit?.id}
              getScheduleFormValue={(val) => setScheduleFormValue(val)}
              getDueDateFormValues={(val) => setDueFormValue(val)}
              getRecommendedTechnicianView={(val) =>
                setRecommendedTechnicians(val)
              }
              getSelectedRadioOption={(val) => setSelectedRadioOption(val)}
              getSelectedTechnicians={(val) => setSelectedTechnicians(val)}
              defaultOption={selectedRadioOption}
              scheduleFormIsErrored={(val) => setScheduleFormErrored(val)}
              dueFormIsErrored={(val) => setDueFormErrored(val)}
              initialRecommendedTechnicians={recommendedTechnicians}
              initialSelectedTechnicians={selectedTechnicians}
            />
          </FlexContainer>
        ) : null}

        {activeStep === 2 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <AddDescription
              getDescription={(val) => setDescription(val)}
              initialDescription={description}
              selectedUnit={selectedUnit}
              selectedTechnicians={selectedTechnicians}
              selectedDateString={selectedDateString || ''}
              selectedTimeString={selectedTimeString || ''}
            />
          </FlexContainer>
        ) : null}
      </FlexContainer>
    </Stepper>
  );
};
