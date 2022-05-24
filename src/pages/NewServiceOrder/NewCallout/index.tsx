/* eslint-disable */
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
import {SelectTechnicians} from '../SelectTechnicians';
import {SelectUnit} from '../SelectUnit';
import {ScheduleTechnicianForm} from '../models';
import {constant} from '../utils';

const steps = [
  'Select unit',
  'Select, date, time & technician',
  'Add description',
];

export const NewCallout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<ElevatorView>();
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  const [selectedRadioOption, setSelectedRadioOption] = useState('');
  const {user} = useUserSession();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [formValue, setFormValue] = useState<ScheduleTechnicianForm | null>(
    null,
  );
  const [formErrored, setFormErrored] = useState<boolean>(false);
  const {mutateAsync: createImmediateCalloutOrder} = useAssignmentBasedOrder(
    'Callout order created',
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
  }, [activeStep, selectedUnit, selectedTechnicians, formErrored]);

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
      type: ServiceOrderType.CALLOUT,
    };
    await createImmediateCalloutOrder(body);
    navigate('/orders?pageIndex=1&pageSize=25&tab=1');
  };

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={async () => {
        if (selectedRadioOption === constant.IMMEDIATE) {
          await createNewImmediateCalloutOrder();
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
              elevatorId={selectedUnit?.id}
              getFormValue={(val) => setFormValue(val)}
              getRecommendedTechnicianView={(val) =>
                setRecommendedTechnicians(val)
              }
              getSelectedRadioOption={(val) => setSelectedRadioOption(val)}
              getSelectedTechnicians={(val) => setSelectedTechnicians(val)}
              defaultOption={selectedRadioOption}
              formIsErrored={(val) => setFormErrored(val)}
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
