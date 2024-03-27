import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {useAssignmentBasedOrder} from 'hooks/reactQuery/useServiceOrder';
import {ElevatorView} from 'models/elevator';
import {useEffect, useRef, useState} from 'react';
import {
  AssignmentDescriptionOrderModel,
  Priority,
  ServiceOrderType,
} from 'models/service-order';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {EmployeesView} from 'models/employee';
import {toRestDateTime} from 'utils/datetime';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {AddDescription} from '../AddDescription';
import {SelectTechnicians} from '../SelectTechnicians';
import {SelectUnit} from '../SelectUnit';
import {RadioOptions} from '../models';

interface Props {
  elevator?: ElevatorView;
}

const steps = ['Select unit', 'Select technicians', 'Add description'];

export const NewEmergency = ({elevator}: Props) => {
  const {t} = useTranslation();
  const [queryParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<ElevatorView>();
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  const currentParams = useRef(Object.fromEntries([...queryParams])).current;
  const {user} = useUserSession();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const {mutateAsync: createEmergencyOrder} = useAssignmentBasedOrder(
    t('Emergency order created successfully'),
  );
  const [recommendedTechnicians, setRecommendedTechnicians] = useState<
    EmployeesView[]
  >([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<
    EmployeesView[]
  >([]);
  const [descriptionValues, setDescriptionValues] =
    useState<AssignmentDescriptionOrderModel>({
      callTime: '',
      callerName: '',
      purchaseOrderNumber: '',
    });

  useEffect(() => {
    if (activeStep === 0 && !selectedUnit) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 1 && !selectedTechnicians.length) {
      return setDisableNextBtn(true);
    }

    return setDisableNextBtn(false);
  }, [activeStep, selectedUnit, selectedTechnicians]);

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

  const createNewEmergencyOrder = async () => {
    const serviceCompanyId = user?.userAccount.serviceCompany.id!;
    const body = {
      description,
      elevatorId: selectedUnit!.id,
      externalId: '',
      priority: Priority.A,
      serviceCompanyId,
      technicianIds: selectedTechnicians.map((item) => item.id),
      time: toRestDateTime(new Date()),
      type: ServiceOrderType.EMERGENCY,
      quotationId: currentParams.quotationId || '',
      callerInfo: {
        calledAt: descriptionValues.callTime ?? null,
        name: descriptionValues.callerName ?? '',
      },
      purchaseOrderNumber: descriptionValues.purchaseOrderNumber ?? '',
    };
    await createEmergencyOrder(body);
    navigate('/orders?tab=1');
  };

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={async () => {
        await createNewEmergencyOrder();
      }}
      disableNextBtn={disableNextBtn}
      initialActiveStep={elevator ? 1 : 0}
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
              defaultOption={RadioOptions.IMMEDIATE}
              elevatorId={selectedUnit?.id}
              getSelectedTechnicians={(val) => setSelectedTechnicians(val)}
              getRecommendedTechnicianView={(val) =>
                setRecommendedTechnicians(val)
              }
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
              getDescriptionValues={(values) => setDescriptionValues(values)}
              initialValues={descriptionValues}
            />
          </FlexContainer>
        ) : null}
      </FlexContainer>
    </Stepper>
  );
};
