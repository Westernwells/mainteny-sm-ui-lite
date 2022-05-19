import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {useState} from 'react';
import {SelectTechnician} from '../SelectTechnician';
import {SelectUnit} from '../SelectUnit';

const steps = ['Select Unit', 'Select Technicians', 'Add Description'];

export const NewEmergency = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedUnitId, setSelectedUnitId] = useState<string>();
  console.log(selectedUnitId);
  return (
    <Stepper
      disableNextBtn={!selectedUnitId}
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
            <SelectUnit getSelectedUnitId={(val) => setSelectedUnitId(val)} />
          </FlexContainer>
        ) : null}
        {activeStep === 1 ? (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <SelectTechnician />
          </FlexContainer>
        ) : null}
      </FlexContainer>
    </Stepper>
  );
};
