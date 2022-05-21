/* eslint-disable */
import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {TechnicianView} from 'models/technician';
import {useEffect, useState} from 'react';
import {AddDescription} from '../AddDescription';
import {SelectTechnician} from '../SelectTechnician';
import {SelectUnit} from '../SelectUnit';

const steps = ['Select Unit', 'Select Technicians', 'Add Description'];

export const NewEmergency = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUnitId, setSelectedUnitId] = useState<string>();
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  const [selectedTechniciansName, setSelectedTechniciansName] = useState<
    string[]
  >([]);
  const [selectedTechniciansId, setSelectedTechniciansId] = useState<string[]>(
    [],
  );
  console.log(selectedTechniciansId, '!!!@@@@@@@##____');

  useEffect(() => {
    if (activeStep === 0 && !selectedUnitId) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 1 && !selectedTechniciansId.length) {
      return setDisableNextBtn(true);
    }

    setDisableNextBtn(false);
  }, [activeStep, selectedUnitId, selectedTechniciansId]);

  console.log(selectedUnitId);
  return (
    <Stepper
      disableNextBtn={disableNextBtn}
      getActiveStep={(val) => setActiveStep(val)}
      steps={steps}
      containerStyles={{
        mt: '3em',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <FlexContainer>
        {activeStep === 0 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <SelectUnit
              getSelectedUnitId={(val) => setSelectedUnitId(val)}
              currentUnitId={selectedUnitId}
            />
          </FlexContainer>
        ) : null}
        {activeStep === 1 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <SelectTechnician
              elevatorId={selectedUnitId}
              getSelectedTechniciansIds={(val) => setSelectedTechniciansId(val)}
              getSelectedTechniciansNames={(val) =>
                setSelectedTechniciansName(val)
              }
              currentSelectedTechnicianIds={selectedTechniciansId}
            />
          </FlexContainer>
        ) : null}

        {activeStep === 2 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <AddDescription />
          </FlexContainer>
        ) : null}
      </FlexContainer>
    </Stepper>
  );
};
