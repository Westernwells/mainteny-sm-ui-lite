import {Dispatch, SetStateAction, useEffect} from 'react';
import SwipeableViews from 'react-swipeable-views';
import {useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import MobileStepper from '@mui/material/MobileStepper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Close from '@mui/icons-material/Close';
import {useTranslation} from 'react-i18next';
import {TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch';

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
  const {t} = useTranslation();
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

  useEffect(() => {
    if (!images[activeStep]) {
      setActiveStep(0);
    }
  }, [images, activeStep]);

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          zIndex: 10,
          width: '100%',
          top: 0,
          px: 3,
          py: 2,
          background:
            'linear-gradient(180deg, #000000 0%, rgba(0, 0, 0, 0) 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Typography variant="h5">{images[activeStep]?.label}</Typography>
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
        disabled
        onChangeIndex={handleStepChange}
        enableMouseEvents
        containerStyle={{alignItems: 'start'}}>
        {images.map((step, index) => (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              '& .react-transform-wrapper': {
                width: '100%',
                '& .react-transform-component': {
                  width: '100%',
                },
              },
            }}
            key={`${step.label} - ${index}`}>
            {Math.abs(activeStep - index) <= 2 ? (
              <TransformWrapper
                wheel={{step: 50, smoothStep: 0.001}}
                pinch={{step: 5}}>
                <TransformComponent>
                  <div
                    style={{
                      backgroundImage: `url(${step.imgPath})`,
                      height: '85vh',
                      width: '100%',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }}
                  />
                </TransformComponent>
              </TransformWrapper>
            ) : null}
          </Box>
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
            disabled={activeStep === 0}
            sx={{mr: 3, display: 'flex', gap: 1}}>
            {theme.direction === 'rtl' ? (
              <ArrowForwardIcon />
            ) : (
              <ArrowBackIcon />
            )}
            {t('Back')}
          </Button>
        }
        nextButton={
          <Button
            size="small"
            color="inherit"
            onClick={handleNext}
            disableRipple
            disabled={activeStep === maxSteps - 1}
            sx={{ml: 3, display: 'flex', gap: 1}}>
            {t('Next')}
            {theme.direction === 'rtl' ? (
              <ArrowBackIcon />
            ) : (
              <ArrowForwardIcon />
            )}
          </Button>
        }
      />
    </>
  );
};
