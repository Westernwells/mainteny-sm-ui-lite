/* eslint-disable */
import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {ElevatorView} from 'models/elevator';
import {TechnicianView} from 'models/technician';
import {useEffect, useState} from 'react';
import {AddDescription} from '../AddDescription';
import {SelectTechnician} from '../SelectTechnician';
import {SelectUnit} from '../SelectUnit';

const steps = ['Select Unit', 'Select Technicians', 'Add Description'];

export const NewEmergency = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<ElevatorView>();
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  const [description, setDescription] = useState('');
  const [recommendedTechnicians, setRecommendedTechnicians] = useState<
    TechnicianView[]
  >([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<
    TechnicianView[]
  >([]);

  console.log(
    selectedTechnicians,
    selectedUnit,
    description,
    '!!!@@@##$$)))$($($$(#(#',
  );

  useEffect(() => {
    if (activeStep === 0 && !selectedUnit) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 1 && !selectedTechnicians.length) {
      return setDisableNextBtn(true);
    }

    setDisableNextBtn(false);
  }, [activeStep, selectedUnit, selectedTechnicians]);

  return (
    <Stepper
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
            />
          </FlexContainer>
        ) : null}
      </FlexContainer>
    </Stepper>
  );
};
