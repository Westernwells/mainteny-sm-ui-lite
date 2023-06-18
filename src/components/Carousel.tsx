import {Dispatch, SetStateAction} from 'react';
import SwipeableViews from 'react-swipeable-views';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import Close from '@mui/icons-material/Close';

export const Carousel = ({
  images,
  onClose,
  activeStep,
  setActiveStep,
}: {
  images: {label: string; imgPath: string}[];
  onClose: () => void;
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
}) => {
  const theme = useTheme();
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          zIndex: 10,
          width: '100%',
          top: 0,
          px: 4,
          py: 3,
          background:
            'linear-gradient(180deg, #000000 0%, rgba(0, 0, 0, 0) 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        <Typography variant="h5">{images[activeStep].label}</Typography>
        <IconButton
          aria-label="close"
          sx={{color: 'white', fontSize: '0.875rem'}}
          onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={activeStep}
        onChangeIndex={handleStepChange}
        enableMouseEvents
        containerStyle={{alignItems: 'center'}}>
        {images.map((step, index) => (
          <div key={step.label}>
            {Math.abs(activeStep - index) <= 2 ? (
              <img width="100%" src={step.imgPath} alt={step.label} />
            ) : null}
          </div>
        ))}
      </SwipeableViews>

      <MobileStepper
        steps={maxSteps}
        variant="text"
        position="static"
        activeStep={activeStep}
        sx={{
          justifyContent: 'center',
          position: 'absolute',
          zIndex: 10,
          width: '100%',
          bottom: 0,
          px: 4,
          py: 3,
          background:
            'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%)',
          color: 'white',
        }}
        backButton={
          <Button
            size="small"
            color="inherit"
            onClick={handleBack}
            disableRipple
            disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? (
              <KeyboardArrowRight />
            ) : (
              <KeyboardArrowLeft />
            )}
          </Button>
        }
        nextButton={
          <Button
            size="small"
            color="inherit"
            onClick={handleNext}
            disableRipple
            disabled={activeStep === maxSteps - 1}>
            {theme.direction === 'rtl' ? (
              <KeyboardArrowLeft />
            ) : (
              <KeyboardArrowRight />
            )}
          </Button>
        }
      />
    </>
  );
};
