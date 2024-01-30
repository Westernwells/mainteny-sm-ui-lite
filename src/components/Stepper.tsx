import {ReactNode, useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import MuiStepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import useTheme from '@mui/material/styles/useTheme';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';

interface Props {
  steps: string[];
  stepperWidth?: string;
  children: ReactNode;
  containerStyles?: {[key: string]: any};
  stepperStyles?: {[key: string]: any};
  handleCancel?: () => void;
  handleSubmit?: () => void;
  initialActiveStep?: number;
  getActiveStep?: (val: number) => void;
  disableNextBtn?: boolean;
  submitting?: boolean;
  disableNavigateBack?: boolean;
  submitLabel?: string;
}

export const Stepper = ({
  steps,
  children,
  containerStyles,
  handleCancel = () => {},
  handleSubmit = () => {},
  initialActiveStep = 0,
  getActiveStep,
  disableNextBtn,
  stepperStyles,
  stepperWidth,
  submitting,
  disableNavigateBack = false,
  submitLabel,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const navigate = useNavigate();

  const getButtonLabel = () => {
    if (activeStep === steps.length - 1) {
      if (submitting) {
        return `${t('Submitting')}...`;
      }
      return submitLabel ? t(`${submitLabel}`) : t('Submit');
    }
    return t('Next');
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  useEffect(() => {
    if (getActiveStep) {
      getActiveStep(activeStep);
    }
  }, [activeStep]);

  useEffect(() => {
    setActiveStep(initialActiveStep);
  }, [initialActiveStep]);

  return (
    <Box sx={{...containerStyles}}>
      <Box sx={{width: stepperWidth || '50%', ...stepperStyles}}>
        <MuiStepper activeStep={activeStep}>
          {steps.map((label) => {
            const stepProps: {completed?: boolean} = {};
            const labelProps: {
              optional?: ReactNode;
            } = {};
            return (
              <Step
                key={label}
                {...stepProps}
                sx={{
                  '&:first-of-type': {
                    pl: 0,
                  },
                }}>
                <StepLabel {...labelProps}>{t(label)}</StepLabel>
              </Step>
            );
          })}
        </MuiStepper>
      </Box>
      <>
        {children}
        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
          <Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
            <Button
              onClick={() => {
                setActiveStep(0);
                if (activeStep === 0 && !disableNavigateBack) {
                  navigate(-1);
                } else {
                  handleCancel();
                }
              }}
              sx={{mr: '1.5em', color: theme.palette.text.secondary}}
              size="large"
              variant="text">
              {t('Cancel')}
            </Button>
            {activeStep > 0 ? (
              <Button
                color="inherit"
                size="large"
                variant="outlined"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{mr: '1.5em'}}>
                {t('Back')}
              </Button>
            ) : null}
            <Box sx={{flex: '1 1 auto'}} />
            <Button
              size="large"
              variant="contained"
              disabled={disableNextBtn}
              onClick={
                activeStep === steps.length - 1 ? handleSubmit : handleNext
              }>
              {getButtonLabel()}
            </Button>
          </Box>
        </Box>
      </>
    </Box>
  );
};
