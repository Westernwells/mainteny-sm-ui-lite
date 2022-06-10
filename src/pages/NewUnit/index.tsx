// import Box from '@mui/material/Box';
/* eslint-disable */
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
import {useEffect, useState} from 'react';
import {AppointmentPreferenceForm} from './AppointmentPreferenceForm';
import {LocationForm} from './LocationForm/index';
import {
  AddPriorityTechnicianFormModel,
  PriorityTechnicianForm,
} from './PriorityTechnicianForm';
import {ServiceForm} from './ServiceForm';
import {UnitDetailsForm} from './UnitDetailsForm';

const steps = [
  'Select customer',
  'Add location',
  'Add unit details',
  'Add service info',
  'Add appointment preferences',
  'Add priority technicians',
];

export const NewUnit = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [techniciansValueMap, setTechnicianValueMap] =
    useState<{[key: string]: TechnicianView | null}>();
  const [locationFormError, setLocationFormError] = useState<
    FormikErrors<LocationFormModel>
  >({});
  const [locationFormValues, setLocationFormValues] =
    useState<LocationFormModel>({
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
    useState<UnitDetailsFormModel>({
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
      emergencyContractNumber: '',
      yearBuilt: '',
      modelOfController: '',
      manufacturerOfController: '',
    });

  const [serviceFormError, setServicesFormError] = useState<
    FormikErrors<ServiceFormModel>
  >({});
  const [serviceFormValues, setServiceFormValues] = useState<ServiceFormModel>({
    lastVisitDate: undefined,
    lastInspectionDate: undefined,
    visitsPerYear: undefined,
    serviceTime: undefined,
    technicianNumber: undefined,
    priority: '',
  });

  const [appointmentPreferenceFormError, setAppointmentPreferenceFormError] =
    useState<FormikErrors<AppointmentFormModel>>({});
  const [appointmentPreferenceFormValues, setAppointmentPreferenceFormValues] =
    useState<AppointmentFormModel>({
      appointmentDaysOfWeek: [],
      openingHour: '',
      closingHour: '',
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
    if (activeStep === 1 && Object.keys(locationFormError).length) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 2 && Object.keys(unitDetailsFormError).length) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 3 && Object.keys(serviceFormError).length) {
      return setDisableNextBtn(true);
    }

    if (
      activeStep === 4 &&
      Object.keys(appointmentPreferenceFormError).length
    ) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 5 && Object.keys(priorityTechnicianFormError).length) {
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

  const createNewUnit = () => {
    // save images and documents
    // save notes
    // create body

    const body = {
      address: locationFormValues.address,
      buildingLocation: locationFormValues.building,
      builtYear: unitDetailsFormValues.yearBuilt,
      cabinType: unitDetailsFormValues.cabinType,
      capacity: unitDetailsFormValues.unitCapacity,
      category: unitDetailsFormValues.category,
      controllerManufacturer: unitDetailsFormValues.manufacturerOfController,
      controllerModel: unitDetailsFormValues.modelOfController,
      documents: [],
      emergencyContractNumber: unitDetailsFormError.emergencyContractNumber,
      emergencyPhoneProvider: unitDetailsFormError.emergencyPhoneProvider,
      keyLocation: locationFormValues.keyLocation,
      lastInspectionDate: serviceFormValues.lastInspectionDate,
      lastVisitDate: serviceFormValues.lastVisitDate,
      manufacturer: unitDetailsFormValues.manufacturer,
      model: unitDetailsFormValues.model,
      number: unitDetailsFormValues.unitNumber,
      numberOfStops: unitDetailsFormValues.numberOfStops,
      parking: locationFormValues.parking,
      pictures: [],
      priority: serviceFormValues.priority,
      properties: {
        ...appointmentPreferenceFormValues,
        appointmentDaysOfWeek:
          appointmentPreferenceFormValues.appointmentDaysOfWeek.join(','),
      },
      // propertyManagerId: elevator.propertyManager?.id || '',
      // propertyOwnerId: elevator.propertyOwner.id,
      propertySegment: locationFormValues.propertySegment,
      // qrCode: elevator.additionalInfo.qrCode,
      serialNumber: unitDetailsFormValues.serialNumber,
      serviceTime: serviceFormValues.serviceTime,
      // status: elevator.status,
      technicianNumber: serviceFormValues.technicianNumber,
      type: serviceFormValues,

      // buildingLocation: elevator.additionalInfo.buildingLocation,
      // builtYear: elevator.additionalInfo.builtYear,
      // cabinType: elevator.additionalInfo.cabinType,
      // capacity: elevator.capacity,
      // category: elevator.category,
      // controllerManufacturer: elevator.additionalInfo.controllerManufacturer,
      // controllerModel: elevator.additionalInfo.controllerModel,
      // documents: elevator.additionalInfo.documents,
      // emergencyContractNumber: elevator.additionalInfo.emergencyContractNumber,
      // emergencyPhoneProvider: elevator.additionalInfo.emergencyPhoneProvider,
      // keyLocation: elevator.additionalInfo.keyLocation,
      // lastInspectionDate: elevator.additionalInfo.lastInspectionDate,
      // lastVisitDate: elevator.lastVisitDate,
      // manufacturer: elevator.additionalInfo.manufacturer,
      // model: elevator.model,
      // number: elevator.number,
      // numberOfStops: elevator.additionalInfo.numberOfStops,
      // parking: elevator.additionalInfo.parking,
      // pictures: elevator.additionalInfo.pictures,
      // priority: elevator.additionalInfo.priority,
      // properties,
      // // propertyManagerId: elevator.propertyManager?.id || '',
      // propertyOwnerId: elevator.propertyOwner.id,
      // propertySegment: elevator.additionalInfo.propertySegment,
      // qrCode: elevator.additionalInfo.qrCode,
      // serialNumber: elevator.serialNumber,
      // serviceTime: elevator.serviceTime,
      // status: elevator.status,
      // technicianNumber: elevator.technicianNumber,
      // type: elevator.type,
    };
  };

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
        {activeStep === 1 ? (
          <LocationForm
            getLocationFormErrors={(errors) => setLocationFormError(errors)}
            getLocationFormValues={(values) => setLocationFormValues(values)}
            initialValues={locationFormValues}
          />
        ) : null}

        {activeStep === 2 ? (
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

        {activeStep === 3 ? (
          <ServiceForm
            getServiceFormErrors={(errors) => setServicesFormError(errors)}
            getServiceFormValues={(values) => setServiceFormValues(values)}
            initialValues={serviceFormValues}
          />
        ) : null}

        {activeStep === 4 ? (
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

        {activeStep === 5 ? (
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
      </FlexContainer>
    </Stepper>
  );
};
