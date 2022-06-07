// import Box from '@mui/material/Box';
import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {FormikErrors, FormikValues} from 'formik';
import {LocationFormModel} from 'models/unitForm';
import React, {useEffect, useState} from 'react';
import {LocationForm} from './LocationForm/index';

const steps = [
  'Add location',
  'Add unit details',
  'Add service info',
  'Add appointment preferences',
  'Add priority technicians',
  'Add Attachments',
];

export const NewUnit = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [locationFormError, setLocationFormError] = useState<
    FormikErrors<LocationFormModel>
  >({});
  const [locationFormValues, setLocationFormValues] = useState<FormikValues>({
    address: undefined,
    building: '',
    propertySegment: '',
    keyLocation: '',
    parking: '',
  });
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  useEffect(() => {
    if (activeStep === 0 && Object.keys(locationFormError).length) {
      return setDisableNextBtn(true);
    }

    return setDisableNextBtn(false);
  }, [activeStep, locationFormError, locationFormValues]);

  return (
    <Stepper
      handleCancel={() => {}}
      handleSubmit={() => {}}
      stepperWidth="100%"
      disableNextBtn={disableNextBtn}
      getActiveStep={(val) => setActiveStep(val)}
      steps={steps}
      containerStyles={{
        flexGrow: 1,
        ml: '0',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <FlexContainer containerStyle={{mt: '1em'}}>
        {activeStep === 0 ? (
          <LocationForm
            getLocationFormErrors={(errors) => setLocationFormError(errors)}
            getLocationFormValues={(values) => setLocationFormValues(values)}
          />
        ) : null}
      </FlexContainer>
    </Stepper>
  );
};
