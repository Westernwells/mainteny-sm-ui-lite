// import Box from '@mui/material/Box';
import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {FormikErrors, FormikValues} from 'formik';
import {TechnicianView} from 'models/technician';
import {
  AppointmentFormModel,
  LocationFormModel,
  PriorityTechnicianFormModel,
  ServiceFormModel,
  UnitDetailsFormModel,
} from 'models/unitForm';
import React, {useEffect, useState} from 'react';
import {AppointmentPreferenceForm} from './AppointmentPreferenceForm';
import {Attachments} from './Attachments';
import {LocationForm} from './LocationForm/index';
import {
  AddPriorityTechnicianFormModel,
  PriorityTechnicianForm,
} from './PriorityTechnicianForm';
import {ServiceForm} from './ServiceForm';
import {UnitDetailsForm} from './UnitDetailsForm';

const steps = [
  'Add location',
  'Add unit details',
  'Add service info',
  'Add appointment preferences',
  'Add priority technicians',
  'Add attachments',
];

export const NewUnit = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [techniciansValueMap, setTechnicianValueMap] =
    useState<{[key: string]: TechnicianView | null}>();
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

  const [serviceFormError, setServicesFormError] = useState<
    FormikErrors<ServiceFormModel>
  >({});
  const [serviceFormValues, setServiceFormValues] = useState<FormikValues>({
    lastVisitDate: '',
    lastInspectionDate: '',
    visitsPerYear: '',
    serviceTime: '',
    technicianNumber: '',
    priority: '',
  });

  const [appointmentPreferenceFormError, setAppointmentPreferenceFormError] =
    useState<FormikErrors<AppointmentFormModel>>({});
  const [appointmentPreferenceFormValues, setAppointmentPreferenceFormValues] =
    useState<FormikValues>({
      appointmentDaysOfWeek: [],
      openingHours: '',
      requiresAppointment: '',
      requiresAppointmentNotification: '',
      appointmentNotificationDueInDays: '',
    });

  const [priorityTechnicianFormError, setPriorityTechnicianFormError] =
    useState<FormikErrors<PriorityTechnicianFormModel>>({});
  const [priorityTechnicianFormValues, setPriorityTechnicianFormValues] =
    useState<FormikValues>({
      technicianId_1: '',
      priority_1: '',
    });

  const [disableNextBtn, setDisableNextBtn] = useState(false);
  useEffect(() => {
    if (activeStep === 0 && Object.keys(locationFormError).length) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 1 && Object.keys(unitDetailsFormError).length) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 2 && Object.keys(serviceFormError).length) {
      return setDisableNextBtn(true);
    }

    if (
      activeStep === 3 &&
      Object.keys(appointmentPreferenceFormError).length
    ) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 4 && Object.keys(priorityTechnicianFormError).length) {
      return setDisableNextBtn(true);
    }

    return setDisableNextBtn(false);
  }, [
    activeStep,
    locationFormError,
    unitDetailsFormError,
    serviceFormError,
    appointmentPreferenceFormError,
  ]);

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

        {activeStep === 2 ? (
          <ServiceForm
            getServiceFormErrors={(errors) => setServicesFormError(errors)}
            getServiceFormValues={(values) => setServiceFormValues(values)}
            initialValues={serviceFormValues}
          />
        ) : null}

        {activeStep === 3 ? (
          <AppointmentPreferenceForm
            getAppointmentFormErrors={(errors) =>
              setAppointmentPreferenceFormError(errors)
            }
            getAppointmentFormValues={(values) =>
              setAppointmentPreferenceFormValues(values)
            }
            initialValues={
              appointmentPreferenceFormValues as AppointmentFormModel
            }
          />
        ) : null}

        {activeStep === 4 ? (
          <PriorityTechnicianForm
            getPriorityTechnicianFormErrors={(errors) =>
              setPriorityTechnicianFormError(errors)
            }
            getPriorityTechnicianFormValues={(values) =>
              setPriorityTechnicianFormValues(values)
            }
            initialValues={
              priorityTechnicianFormValues as AddPriorityTechnicianFormModel
            }
            getTechnicianMapValue={(item) => setTechnicianValueMap(item)}
            initialTechniciansValueMap={techniciansValueMap}
          />
        ) : null}

        {activeStep === 5 ? <Attachments /> : null}
      </FlexContainer>
    </Stepper>
  );
};
