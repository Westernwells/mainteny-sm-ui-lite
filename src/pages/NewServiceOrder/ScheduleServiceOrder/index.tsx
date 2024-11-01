import {Typography} from '@mui/material';
import {t} from 'i18next';
import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {useCreateServiceOrder} from 'hooks/reactQuery/useServiceOrder';
import {ElevatorView} from 'models/elevator';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  AssignmentDescriptionOrderModel,
  ContactChannel,
  CreateServiceOrderRecord,
  Priority,
} from 'models/service-order';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {EmployeesView} from 'models/employee';
import {useFormatDate} from 'hooks/useFormatDate';
import {toRestDateTime} from 'utils/datetime';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {ContractStatus} from 'models/contract';
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
  type: string;
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

  const {contractPONumber} = useMemo(() => {
    const activeContracts =
      selectedUnit?.contracts.filter(
        (item) =>
          item.status === ContractStatus.EXPIRING ||
          item.status === ContractStatus.VALID,
      ) ?? [];

    const PONumber =
      activeContracts.length === 1
        ? activeContracts[0].additionalInfo.purchaseOrderNumber ?? ''
        : '';

    return {
      elevatorActiveContracts: activeContracts,
      contractPONumber: PONumber,
    };
  }, [selectedUnit]);

  const [descriptionValues, setDescriptionValues] =
    useState<AssignmentDescriptionOrderModel>({
      callTime: '',
      callerName: '',
      purchaseOrderNumber: contractPONumber,
    });

  const {mutateAsync: createServiceOrder, isLoading: isCreatingOrder} =
    useCreateServiceOrder('Order scheduled successfully');

  const [recommendedTechnicians, setRecommendedTechnicians] = useState<
    EmployeesView[]
  >([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<
    EmployeesView[]
  >([]);
  const [selectedUnitChange, setSelectedUnitChange] = useState(false);
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

  useEffect(() => {
    setDescriptionValues((prevValues) => ({
      ...prevValues,
      purchaseOrderNumber: contractPONumber,
    }));
  }, [selectedUnit]);

  const handleCancel = () => {
    setActiveStep(0);
    setSelectedUnit(undefined);
    setRecommendedTechnicians([]);
    setSelectedTechnicians([]);
    setDescription('');
  };

  const startDateTime = scheduleFormValue?.startDate
    ? new Date(
        scheduleFormValue.startDate.getFullYear(),
        scheduleFormValue.startDate.getMonth(),
        scheduleFormValue.startDate.getDate(),
        (scheduleFormValue?.startTime || new Date()).getHours(),
        (scheduleFormValue?.startTime || new Date()).getMinutes(),
      )
    : null;
  const endDateTime = scheduleFormValue?.endDate
    ? new Date(
        scheduleFormValue.endDate.getFullYear(),
        scheduleFormValue.endDate.getMonth(),
        scheduleFormValue.endDate.getDate(),
        (scheduleFormValue?.endTime || new Date()).getHours(),
        (scheduleFormValue?.endTime || new Date()).getMinutes(),
      )
    : null;

  const createOrder = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id!;
    const dueDate = formatDate(dueDateFormValue?.date!, 'yyy-MM-dd')!;
    const body: CreateServiceOrderRecord = {
      dueDate,
      description,
      elevatorId: currentParams.elevatorId || selectedUnit!.id,
      externalId: '',
      priority: Priority.A,
      serviceCompanyId,
      technicianIds: selectedTechnicians.map((item) => item.id),
      type,
      ...(startDateTime && endDateTime
        ? {
            timeRange: {
              start: toRestDateTime(startDateTime),
              end: toRestDateTime(endDateTime),
            },
          }
        : {}),
      quotationId: currentParams.quotationId || '',
      callerInfo: {
        calledAt: descriptionValues.callTime ?? null,
        name: descriptionValues.callerName ?? '',
      },
      purchaseOrderNumber: descriptionValues.purchaseOrderNumber ?? '',
      ...(requireTechnicianNotification
        ? {confirmationChannels: notificationChannels}
        : {notificationChannels}),
    };

    const resp = await createServiceOrder(body);
    navigate(`/orders/details/${resp.data.value}`, {replace: true});
  };

  const selectedDateTimeString =
    startDateTime && endDateTime
      ? `${formatDate(startDateTime, 'dd.MM.yyyy')} at ${formatDate(
          endDateTime,
          'HH:mm',
        )}`
      : '';

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={createOrder}
      submitting={isCreatingOrder}
      disableNextBtn={disableNextBtn || isCreatingOrder}
      initialActiveStep={elevator ? 1 : 0}
      getActiveStep={(val) => {
        if (val === 2) {
          setSelectedUnitChange(false);
        }
        setActiveStep(val);
      }}
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
            getSelectedUnit={(val) => {
              if (val === selectedUnit) {
                setSelectedUnitChange(false);
              } else {
                setSelectedUnitChange(true);
              }
              setSelectedUnit(val);
            }}
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
            selectedUnitChange={selectedUnitChange}
            serviceOrderType={type}
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
