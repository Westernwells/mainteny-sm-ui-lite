import Box from '@mui/material/Box';
import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import React from 'react';

const steps = [
  'Add location',
  'Add unit details',
  'Add service info',
  'Add appointment preferences',
  'Add priority technicians',
  'Add Attachments',
];

export const NewUnit = () => {
  console.log();
  return (
    <Stepper
      handleCancel={() => {}}
      handleSubmit={() => {}}
      stepperWidth="100%"
      // disableNextBtn={disableNextBtn}
      getActiveStep={(val) => console.log(val)}
      steps={steps}
      containerStyles={{
        flexGrow: 1,
        ml: '0',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <FlexContainer>
        <Box />
      </FlexContainer>
    </Stepper>
  );
};
