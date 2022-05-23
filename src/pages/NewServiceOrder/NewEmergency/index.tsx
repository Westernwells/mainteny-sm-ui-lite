import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {useAssignmentBasedOrder} from 'hooks/reactQuery/useServiceOrder';
import {ElevatorView} from 'models/elevator';
import {TechnicianView} from 'models/technician';
import {useEffect, useState} from 'react';
import {ServiceOrderPriority, ServiceOrderType} from 'models/service-order';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {toRestDateTime} from 'utils/datetime';
import {useNavigate} from 'react-router';
import {AddDescription} from '../AddDescription';
import {SelectTechnician} from '../SelectTechnician';
import {SelectUnit} from '../SelectUnit';

const steps = ['Select Unit', 'Select Technicians', 'Add Description'];

export const NewEmergency = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<ElevatorView>();
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  const {user} = useUserSession();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const {mutateAsync: createEmergencyOrder} = useAssignmentBasedOrder(
    'Emergency order created',
  );
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

    if (activeStep === 1 && !selectedTechnicians.length) {
      return setDisableNextBtn(true);
    }

    return setDisableNextBtn(false);
  }, [activeStep, selectedUnit, selectedTechnicians]);

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
      priority: ServiceOrderPriority.A,
      serviceCompanyId,
      technicianIds: selectedTechnicians.map((item) => item.id),
      time: toRestDateTime(new Date()),
      type: ServiceOrderType.EMERGENCY,
    };
    await createEmergencyOrder(body);
    navigate('/orders?pageIndex=1&pageSize=25&tab=1');
  };

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={async () => {
        await createNewEmergencyOrder();
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
            <SelectTechnician
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
            />
          </FlexContainer>
        ) : null}
      </FlexContainer>
    </Stepper>
  );
};
