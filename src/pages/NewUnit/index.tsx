// import Box from '@mui/material/Box';
import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {FormikErrors, FormikValues} from 'formik';
import {LocationFormModel, UnitDetailsFormModel} from 'models/unitForm';
import React, {useEffect, useState} from 'react';
import {LocationForm} from './LocationForm/index';
import {UnitDetailsForm} from './UnitDetailsForm';

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

  const [unitDetailsFormError, setUnitDetailsFormError] = useState<
    FormikErrors<UnitDetailsFormModel>
  >({});
  const [unitDetailsFormValues, setUnitDetailsFormValues] =
    useState<FormikValues>({
      category: '',
      manufacturer: '',
      unitNumber: '',
      numberOfStops: undefined,
      cabinType: '',
      emergencyPhoneProvider: '',
      unitType: '',
      model: '',
      serialNumber: '',
      unitCapacity: '',
      spendingLimit: undefined,
    });
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  useEffect(() => {
    if (activeStep === 0 && Object.keys(locationFormError).length) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 1 && Object.keys(unitDetailsFormError).length) {
      console.log(unitDetailsFormError, '|||||>>>>>??');
      return setDisableNextBtn(true);
    }

    return setDisableNextBtn(false);
  }, [activeStep, locationFormError, unitDetailsFormError]);

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
            initialValues={locationFormValues}
          />
        ) : null}

        {activeStep === 1 ? (
          <UnitDetailsForm
            getUnitDetailsFormErrors={(errors) =>
              setUnitDetailsFormError(errors)
            }
            getUnitDetailsFormValues={(values) =>
              setUnitDetailsFormValues(values)
            }
            initialValues={unitDetailsFormValues}
          />
        ) : null}
      </FlexContainer>
    </Stepper>
  );
};
