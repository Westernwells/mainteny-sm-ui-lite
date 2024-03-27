import {Typography} from '@mui/material';
import {t} from 'i18next';
import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {
  useCreateNonScheduledServiceOrder,
  useCreateScheduledServiceOrder,
} from 'hooks/reactQuery/useServiceOrder';
import {ElevatorView} from 'models/elevator';
import {useEffect, useRef, useState} from 'react';
import {
  AssignmentDescriptionOrderModel,
  ContactChannel,
  Priority,
  ServiceOrderType,
} from 'models/service-order';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {EmployeesView} from 'models/employee';
import {useFormatDate} from 'hooks/useFormatDate';
import {toRestDateTime} from 'utils/datetime';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {AddDescription} from '../AddDescription';
import {SelectTechnicians} from '../SelectTechnicians';
import {SelectUnit} from '../SelectUnit';
import {DueDateFormProps, ScheduleTechnicianForm} from '../models';

const steps = [
  'Select Unit',
  'Select due date and engineer(s)',
  'Additional Information',
];

interface Props {
  type: ServiceOrderType;
  elevator?: ElevatorView;
}

export const ScheduleServiceOrder = ({type, elevator}: Props) => {
  const [queryParams] = useSearchParams();
  const currentParams = useRef(Object.fromEntries([...queryParams])).current;
  const formatDate = useFormatDate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<ElevatorView>();
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  const {user} = useUserSession();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [scheduleFormValue, setScheduleFormValue] =
    useState<ScheduleTechnicianForm | null>(null);
  const [dueDateFormValue, setdueDateFormValue] =
    useState<DueDateFormProps | null>(null);
  const [dueDateFormErrored, setdueDateFormErrored] = useState<boolean>(false);
  const [requireTechnicianNotification, setRequireTechnicianNotification] =
    useState<boolean>(false);
  const [notificationChannels, setNotificationChannels] = useState<
    ContactChannel[]
  >([ContactChannel.PUSH_NOTIFICATION]);

  const [descriptionValues, setDescriptionValues] =
    useState<AssignmentDescriptionOrderModel>({
      callTime: '',
      callerName: '',
      purchaseOrderNumber: '',
    });

  const {
    mutateAsync: createScheduledServiceOrder,
    isLoading: isSchedulingOrder,
  } = useCreateScheduledServiceOrder('Order scheduled successfully');
  const {
    mutateAsync: createNonScheduledServiceOrder,
    isLoading: isCreatingNonScheduledOrder,
  } = useCreateNonScheduledServiceOrder('Order created successfully');

  const [recommendedTechnicians, setRecommendedTechnicians] = useState<
    EmployeesView[]
  >([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<
    EmployeesView[]
  >([]);

  useEffect(() => {
    if (activeStep === 0 && !selectedUnit) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 1 && dueDateFormErrored) {
      return setDisableNextBtn(true);
    }

    return setDisableNextBtn(false);
  }, [activeStep, selectedUnit, dueDateFormErrored]);

  useEffect(() => {
    if (elevator) {
      setSelectedUnit(elevator);
      setActiveStep(1);
    }
  }, [elevator]);

  const handleCancel = () => {
    setActiveStep(0);
    setSelectedUnit(undefined);
    setRecommendedTechnicians([]);
    setSelectedTechnicians([]);
    setDescription('');
  };

  const createScheduledOrder = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id!;
    const dueDate = formatDate(dueDateFormValue?.date!, 'yyy-MM-dd')!;
    const startTime = toRestDateTime(scheduleFormValue!.startTime!);
    const endTime = toRestDateTime(scheduleFormValue!.endTime!);
    const body = {
      dueDate,
      description,
      elevatorId: currentParams.elevatorId || selectedUnit!.id,
      externalId: '',
      priority: Priority.A,
      serviceCompanyId,
      technicianIds: selectedTechnicians.map((item) => item.id),
      type,
      requireReschedule: true,
      requireTechnicianNotification,
      startTime,
      endTime,
      quotationId: currentParams.quotationId || '',
      callerInfo: {
        calledAt: descriptionValues.callTime ?? null,
        name: descriptionValues.callerName ?? '',
      },
      purchaseOrderNumber: descriptionValues.purchaseOrderNumber ?? '',
      notificationChannels,
    };

    await createScheduledServiceOrder(body);
    navigate('/orders?tab=1');
  };

  const createNonScheduledOrder = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id!;
    const dueDate = formatDate(dueDateFormValue?.date!, 'yyy-MM-dd')!;
    const body = {
      description,
      elevatorId: currentParams.elevatorId || selectedUnit!.id,
      externalId: '',
      priority: Priority.A,
      serviceCompanyId,
      type,
      dueDate,
      quotationId: currentParams.quotationId || '',
      callerInfo: {
        calledAt: descriptionValues.callTime ?? null,
        name: descriptionValues.callerName ?? '',
      },
      purchaseOrderNumber: descriptionValues.purchaseOrderNumber ?? '',
      notificationChannels,
    };

    await createNonScheduledServiceOrder(body);
    navigate('/orders?tab=1');
  };

  const handleSubmit = async () => {
    if (
      selectedTechnicians.length > 0 &&
      dueDateFormValue?.date &&
      scheduleFormValue?.startTime &&
      scheduleFormValue?.endTime
    ) {
      return createScheduledOrder();
    }
    return createNonScheduledOrder();
  };

  const selectedDateTimeString =
    scheduleFormValue?.startTime && scheduleFormValue.endTime
      ? `${formatDate(
          scheduleFormValue.startTime,
          'dd.MM.yyyy',
        )} at ${formatDate(scheduleFormValue.startTime, 'HH:mm')}`
      : '';

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={() => handleSubmit()}
      submitting={isCreatingNonScheduledOrder || isSchedulingOrder}
      disableNextBtn={
        disableNextBtn || isCreatingNonScheduledOrder || isSchedulingOrder
      }
      initialActiveStep={elevator ? 1 : 0}
      getActiveStep={(val) => setActiveStep(val)}
      steps={steps}
      containerStyles={{
        flexGrow: 1,
        ml: '0',
        display: 'flex',
        flexDirection: 'column',
      }}
      stepperStyles={{
        width: '70%',
        pt: 1,
      }}>
      <FlexContainer
        containerStyle={{
          backgroundColor: 'white',
          boxShadow: '0px 4px 15px rgba(144, 144, 144, 0.2)',
          p: 3,
          mt: 3,
        }}>
        <Typography variant="h5" color="primary" py={2}>
          {t(steps[activeStep])}
        </Typography>
        {activeStep === 0 ? (
          <SelectUnit
            getSelectedUnit={(val) => setSelectedUnit(val)}
            initialSelectedUnit={selectedUnit}
          />
        ) : activeStep === 1 ? (
          <SelectTechnicians
            elevatorId={selectedUnit?.id}
            scheduleFormValue={scheduleFormValue}
            getScheduleFormValue={(val) => setScheduleFormValue(val)}
            dueDateFormValue={dueDateFormValue}
            getDueDateFormValues={(val) => setdueDateFormValue(val)}
            getRecommendedTechnicianView={(val) =>
              setRecommendedTechnicians(val)
            }
            getSelectedTechnicians={(val) => setSelectedTechnicians(val)}
            dueDateFormIsErrored={(val) => setdueDateFormErrored(val)}
            initialRecommendedTechnicians={recommendedTechnicians}
            initialSelectedTechnicians={selectedTechnicians}
            requireTechnicianNotification={requireTechnicianNotification}
            setRequireTechnicianNotification={setRequireTechnicianNotification}
            notificationChannels={notificationChannels}
            setNotificationChannels={setNotificationChannels}
          />
        ) : (
          <AddDescription
            getDescription={(val) => setDescription(val)}
            initialDescription={description}
            selectedUnit={selectedUnit!}
            selectedTechnicians={selectedTechnicians}
            selectedDateTimeString={selectedDateTimeString || ''}
            getDescriptionValues={(values) => setDescriptionValues(values)}
            initialValues={descriptionValues}
          />
        )}
      </FlexContainer>
    </Stepper>
  );
};
