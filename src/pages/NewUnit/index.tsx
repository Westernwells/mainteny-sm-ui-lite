import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {FormikErrors} from 'formik';
import {useAddElevator, useAllElevators} from 'hooks/reactQuery/useElevator';
import {useFormatDate} from 'hooks/useFormatDate';
import {ElevatorStatus, ElevatorView} from 'models/elevator';
import {Priority} from 'models/misc';
import {PropertyOwnerView} from 'models/propertyManager';
import {
  AppointmentFormModel,
  CustomerFormModel,
  LocationFormModel,
  ServiceFormModel,
  UnitDetailsFormModel,
} from 'models/unitForm';
import {mapDaysOfWeekOptions} from 'pages/UnitDetails/Tabs/OverviewTab/AppointmentPreference/EditAppointmentForm';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {convertToMacro} from 'utils/utils';
import {createEmptyResource} from 'utils/paging-utils';
import {AppointmentPreferenceForm} from './AppointmentPreferenceForm';
import {CustomerForm} from './CustomerForm';
import {LocationForm} from './LocationForm/index';
import {ServiceForm} from './ServiceForm';
import {UnitDetailsForm} from './UnitDetailsForm';

const steps = [
  'Select customer',
  'Add location',
  'Add unit details',
  'Add service info',
  'Add appointment preferences',
];

export const NewUnit = () => {
  const formatDate = useFormatDate();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const [customerFormError, setCustomerFormError] = useState<
    FormikErrors<CustomerFormModel>
  >({});
  const [customerFormValues, setCustomerFormValues] =
    useState<CustomerFormModel>({
      propertyOwnerId: '',
    });
  const [customer, setCustomer] = useState<PropertyOwnerView>();

  const {mutateAsync: addNewUnit, isLoading: isSubmitting} = useAddElevator(
    'Unit created successfully',
  );

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
      externalId: '',
      numberOfStops: undefined,
      cabinType: '',
      emergencyPhoneProvider: '',
      unitType: '',
      model: '',
      serialNumber: '',
      unitCapacity: '',
      spendingLimit: undefined,
      emergencyContactNumber: '',
      yearBuilt: undefined,
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
    priority: Priority.NONE,
  });

  const [appointmentPreferenceFormError, setAppointmentPreferenceFormError] =
    useState<FormikErrors<AppointmentFormModel>>({});
  const [appointmentPreferenceFormValues, setAppointmentPreferenceFormValues] =
    useState<AppointmentFormModel>({
      appointmentDaysOfWeek: ['Mo', 'Tu', 'We', 'Th', 'Fr'],
      openingHour: '',
      closingHour: '',
      shouldNotifyCustomer: true,
      appointmentNotificationDue: 0,
    });

  const [disableNextBtn, setDisableNextBtn] = useState(false);
  useEffect(() => {
    if (activeStep === 0 && Object.keys(customerFormError).length) {
      return setDisableNextBtn(true);
    }

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

    return setDisableNextBtn(false);
  }, [
    activeStep,
    locationFormError,
    unitDetailsFormError,
    serviceFormError,
    appointmentPreferenceFormError,
    customerFormError,
  ]);

  const createNewUnit = async () => {
    const body = {
      address: locationFormValues.address,
      buildingLocation: locationFormValues.building,
      builtYear: unitDetailsFormValues.yearBuilt,
      cabinType: unitDetailsFormValues.cabinType,
      capacity: unitDetailsFormValues.unitCapacity,
      category: convertToMacro(unitDetailsFormValues.category!),
      controllerManufacturer: unitDetailsFormValues.manufacturerOfController,
      controllerModel: unitDetailsFormValues.modelOfController,
      documents: [],
      emergencyContactNumber: unitDetailsFormError.emergencyContactNumber,
      emergencyPhoneProvider: unitDetailsFormError.emergencyPhoneProvider,
      keyLocation: locationFormValues.keyLocation,
      lastInspectionDate: formatDate(
        serviceFormValues.lastInspectionDate,
        'yyyy-MM-dd',
      ),
      lastVisitDate: formatDate(serviceFormValues.lastVisitDate, 'yyyy-MM-dd'),
      manufacturer: unitDetailsFormValues.manufacturer,
      model: unitDetailsFormValues.model,
      externalId: unitDetailsFormValues.externalId,
      numberOfStops: unitDetailsFormValues.numberOfStops,
      parking: locationFormValues.parking,
      pictures: [],
      priority: serviceFormValues.priority as Priority,
      properties: {},
      propertyOwnerId: customerFormValues.propertyOwnerId,
      propertySegment: locationFormValues.propertySegment,
      serialNumber: unitDetailsFormValues.serialNumber,
      serviceTime: serviceFormValues.serviceTime,
      status: ElevatorStatus.RUNNING,
      technicianNumber: serviceFormValues.technicianNumber,
      type: unitDetailsFormValues.unitType,
      ...(appointmentPreferenceFormValues.openingHour &&
        appointmentPreferenceFormValues.closingHour && {
          timeRule: {
            daysTimeRange: [
              {
                daysOfWeek:
                  appointmentPreferenceFormValues.appointmentDaysOfWeek.map(
                    (val) =>
                      mapDaysOfWeekOptions[
                        val as keyof typeof mapDaysOfWeekOptions
                      ].toUpperCase(),
                  ),
                timeRange: {
                  start: appointmentPreferenceFormValues.openingHour || '',
                  end: appointmentPreferenceFormValues.closingHour || '',
                },
              },
            ],
          },
        }),
      customerAppointment: {
        shouldNotifyCustomer:
          appointmentPreferenceFormValues.shouldNotifyCustomer,
        appointmentNotificationDue:
          appointmentPreferenceFormValues.appointmentNotificationDue,
      },
    };

    const response = await addNewUnit(body);
    if (response) {
      navigate(`/units/details/${response.value}`, {replace: true});
    }
  };

  const {data: elevatorResponse = createEmptyResource<ElevatorView>(10)} =
    useAllElevators(
      {
        query: unitDetailsFormValues.externalId,
        pageIndex: 0,
        pageSize: 50,
      },
      {keepPreviousData: true},
    );

  return (
    <Stepper
      handleCancel={() => {}}
      handleSubmit={() => createNewUnit()}
      stepperWidth="100%"
      disableNextBtn={disableNextBtn || isSubmitting}
      submitting={isSubmitting}
      getActiveStep={(val) => setActiveStep(val)}
      steps={steps}
      containerStyles={{
        flexGrow: 1,
        ml: '0',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <FlexContainer
        containerStyle={{mt: '1em', overflowY: 'scroll', height: 0}}>
        {activeStep === 0 ? (
          <CustomerForm
            getCustomerFormErrors={(errors) => setCustomerFormError(errors)}
            getCustomerFormValues={(values) => setCustomerFormValues(values)}
            initialValues={customerFormValues}
            getCustomer={(item) => setCustomer(item)}
            initialCustomer={customer}
          />
        ) : null}
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
            customerResource={elevatorResponse.data}
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
      </FlexContainer>
    </Stepper>
  );
};

export default NewUnit;
