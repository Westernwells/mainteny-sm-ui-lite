import {ReactNode, useState} from 'react';
import Box from '@mui/material/Box';
import MuiStepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import useTheme from '@mui/material/styles/useTheme';

interface Props {
  steps: string[];
  children: ReactNode;
  containerStyles?: {[key: string]: any};
  handleCancel?: () => void;
  handleSubmit?: () => void;
}

export const Stepper = ({
  steps,
  children,
  containerStyles,
  handleCancel = () => {},
  handleSubmit = () => {},
}: Props) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{...containerStyles}}>
      <Box sx={{width: '50%'}}>
        <MuiStepper activeStep={activeStep}>
          {steps.map((label) => {
            const stepProps: {completed?: boolean} = {};
            const labelProps: {
              optional?: ReactNode;
            } = {};
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </MuiStepper>
      </Box>
      <>
        {children}
        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
          <Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
            {activeStep > 0 ? (
              <>
                <Button
                  onClick={handleCancel}
                  sx={{mr: '1.5em', color: theme.palette.text.secondary}}
                  variant="text">
                  Cancel
                </Button>
                <Button
                  color="inherit"
                  variant="outlined"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{mr: '1.5em'}}>
                  Back
                </Button>
              </>
            ) : null}
            <Box sx={{flex: '1 1 auto'}} />
            <Button
              variant="contained"
              onClick={
                activeStep === steps.length - 1 ? handleSubmit : handleNext
              }>
              {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </Box>
        </Box>
      </>
    </Box>
  );
};
