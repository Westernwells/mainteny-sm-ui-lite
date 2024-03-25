import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {
  useAssignmentBasedOrder,
  useCreateNonScheduledServiceOrder,
  useCreateScheduledServiceOrder,
} from 'hooks/reactQuery/useServiceOrder';
import {ElevatorView} from 'models/elevator';
import {useEffect, useRef, useState} from 'react';
import {
  AssignmentDescriptionOrderModel,
  Priority,
  ServiceOrderType,
} from 'models/service-order';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {EmployeesView} from 'models/employee';
import {QuotationView} from 'models/quotation';
import {useFormatDate} from 'hooks/useFormatDate';
import {setDateTime, toRestDateTime} from 'utils/datetime';
import {useNavigate, useSearchParams} from 'react-router-dom';
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
  'Select date, time & technicians',
  'Add description',
];

interface Props {
  type: Exclude<ServiceOrderType, ServiceOrderType.EMERGENCY>;
  quotation?: QuotationView;
}

export const ScheduleServiceOrder = ({type, quotation}: Props) => {
  const [queryParams] = useSearchParams();
  const currentParams = useRef(Object.fromEntries([...queryParams])).current;
  const formatDate = useFormatDate();
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
  const [dueDateFormValue, setdueDateFormValue] =
    useState<DueDateFormProps | null>(null);
  const [scheduleFormErrored, setScheduleFormErrored] =
    useState<boolean>(false);
  const [dueDateFormErrored, setdueDateFormErrored] = useState<boolean>(false);
  const {
    mutateAsync: createImmediateCalloutOrder,
    isLoading: isCreatingImmediateCalloutOrder,
  } = useAssignmentBasedOrder('Order created successfully');

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
      dueDateFormErrored
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
    dueDateFormErrored,
    selectedRadioOption,
  ]);

  useEffect(() => {
    if (quotation) {
      setSelectedUnit(quotation.elevator);
      setActiveStep(1);
    }
  }, [quotation]);

  useEffect(() => {
    let dateString;
    let timeString;
    if (selectedRadioOption === RadioOptions.DUE_DATE) {
      dateString = formatDate(dueDateFormValue?.date!);
    }
    if (selectedRadioOption === RadioOptions.SCHEDULE_TECHNICIAN) {
      dateString = formatDate(scheduleFormValue?.date!);
      timeString = `${formatDate(
        scheduleFormValue?.startTime!,
        'HH:mm',
      )}-${formatDate(scheduleFormValue?.endTime!, 'HH:mm')}`;
    }
    setSelectedDateString(dateString);
    setSelectedTimeString(timeString);
  }, [scheduleFormValue, dueDateFormValue]);

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
      elevatorId: currentParams.elevatorId || selectedUnit!.id,
      externalId: '',
      priority: Priority.A,
      serviceCompanyId,
      technicianIds: selectedTechnicians.map((item) => item.id),
      time: toRestDateTime(new Date()),
      type,
      quotationId: quotation ? quotation.id : '',
      callerInfo: {
        calledAt: descriptionValues.callTime ?? null,
        name: descriptionValues.callerName ?? '',
      },
      purchaseOrderNumber: descriptionValues.purchaseOrderNumber ?? '',
    };
    await createImmediateCalloutOrder(body);
    navigate('/orders?tab=1');
  };

  const createScheduledOrder = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id!;
    const startTime = toRestDateTime(
      setDateTime(
        scheduleFormValue!.date!,
        formatDate(scheduleFormValue!.startTime!, 'HH:mm')!,
      ),
    );
    const endTime = toRestDateTime(
      setDateTime(
        scheduleFormValue!.date!,
        formatDate(scheduleFormValue!.endTime!, 'HH:mm')!,
      ),
    );
    const body = {
      description,
      elevatorId: currentParams.elevatorId || selectedUnit!.id,
      externalId: '',
      priority: Priority.A,
      serviceCompanyId,
      technicianIds: selectedTechnicians.map((item) => item.id),
      type,
      requireReschedule: true,
      requireTechnicianNotification: true,
      startTime,
      endTime,
      quotationId: quotation ? quotation.id : '',
      callerInfo: {
        calledAt: descriptionValues.callTime ?? null,
        name: descriptionValues.callerName ?? '',
      },
      purchaseOrderNumber: descriptionValues.purchaseOrderNumber ?? '',
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
      quotationId: quotation ? quotation.id : '',
      callerInfo: {
        calledAt: descriptionValues.callTime ?? null,
        name: descriptionValues.callerName ?? '',
      },
      purchaseOrderNumber: descriptionValues.purchaseOrderNumber ?? '',
    };

    await createNonScheduledServiceOrder(body);
    navigate('/orders?tab=1');
  };

  const handleSubmit = async () => {
    if (selectedRadioOption === RadioOptions.IMMEDIATE) {
      await createNewImmediateCalloutOrder();
    }

    if (selectedRadioOption === RadioOptions.DUE_DATE) {
      await createNonScheduledOrder();
    }

    if (selectedRadioOption === RadioOptions.SCHEDULE_TECHNICIAN) {
      await createScheduledOrder();
    }
  };

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={() => handleSubmit()}
      submitting={
        isCreatingImmediateCalloutOrder ||
        isCreatingNonScheduledOrder ||
        isSchedulingOrder
      }
      disableNextBtn={
        disableNextBtn ||
        isCreatingImmediateCalloutOrder ||
        isCreatingNonScheduledOrder ||
        isSchedulingOrder
      }
      initialActiveStep={quotation ? 1 : 0}
      getActiveStep={(val) => setActiveStep(val)}
      steps={steps}
      containerStyles={{
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
              elevatorId={currentParams.elevatorId || selectedUnit?.id}
              getScheduleFormValue={(val) => setScheduleFormValue(val)}
              getDueDateFormValues={(val) => setdueDateFormValue(val)}
              getRecommendedTechnicianView={(val) =>
                setRecommendedTechnicians(val)
              }
              getSelectedRadioOption={(val) => setSelectedRadioOption(val)}
              getSelectedTechnicians={(val) => setSelectedTechnicians(val)}
              defaultOption={selectedRadioOption}
              scheduleFormIsErrored={(val) => setScheduleFormErrored(val)}
              dueDateFormIsErrored={(val) => setdueDateFormErrored(val)}
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
              selectedRadioOption={selectedRadioOption}
              selectedUnit={selectedUnit}
              selectedTechnicians={selectedTechnicians}
              selectedDateString={selectedDateString || ''}
              selectedTimeString={selectedTimeString || ''}
              getDescriptionValues={(values) => setDescriptionValues(values)}
              initialValues={descriptionValues}
            />
          </FlexContainer>
        ) : null}
      </FlexContainer>
    </Stepper>
  );
};
