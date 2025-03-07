import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {FormikErrors, useFormik} from 'formik';
import {useAddElevator, useAllElevators} from 'hooks/reactQuery/useElevator';
import {useFormatDate} from 'hooks/useFormatDate';
import {
  ElevatorRequestBody,
  ElevatorStatus,
  ElevatorView,
} from 'models/elevator';
import {AddressRecord, Priority} from 'models/misc';
import {PropertyOwnerView} from 'models/propertyManager';
import {
  AppointmentFormModel,
  CustomerFormModel,
  LocationFormModel,
  SeparateAddressFormModal,
  ServiceFormModel,
  UnitDetailsFormModel,
} from 'models/unitForm';
import {mapDaysOfWeekOptions} from 'pages/UnitDetails/Tabs/OverviewTab/AppointmentPreference/EditAppointmentForm';
import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {convertToMacro, formatAddressFullname} from 'utils/utils';
import {createEmptyResource} from 'utils/paging';
import {useGetCustomer} from 'hooks/reactQuery/useCustomers';
import {Progress} from 'components/Progress';
import Notes from 'pages/CustomerDetails/Notes';
import {Box} from '@mui/material';
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

const LOCATION_DEFAULT_VALUES = {
  address: undefined,
  building: '',
  propertySegment: '',
  keyLocation: '',
  parking: '',
};

export const NewUnit = () => {
  const formatDate = useFormatDate();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [queryParams] = useSearchParams();
  const customerIdFromQueryString = queryParams.get('customer') || undefined;
  const {data: prefilledCustomer, isLoading: isLoadingPrefillCustomer} =
    customerIdFromQueryString
      ? useGetCustomer(customerIdFromQueryString)
      : {
          data: undefined,
          isLoading: false,
        };
  const [isSeparateAddressEnabled, setIsSeparateAddressEnabled] =
    useState(false);
  const [customerFormError, setCustomerFormError] = useState<
    FormikErrors<CustomerFormModel>
  >({});
  const [customerFormValues, setCustomerFormValues] =
    useState<CustomerFormModel>({
      propertyOwnerId: customerIdFromQueryString || '',
    });
  const [customer, setCustomer] = useState<PropertyOwnerView>();

  const {mutateAsync: addNewUnit, isLoading: isSubmitting} = useAddElevator(
    'Unit created successfully',
  );

  const [locationFormError, setLocationFormError] = useState<
    FormikErrors<LocationFormModel>
  >({});
  const [locationFormValues, setLocationFormValues] =
    useState<LocationFormModel>(LOCATION_DEFAULT_VALUES);

  const separateAddressFormik = useFormik<SeparateAddressFormModal>({
    initialValues: {
      billingAddress: {
        fullName: '',
      },
      beneficiaryAddress: {
        fullName: '',
      },
    },
    onSubmit: () => {},
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
      requiresAppointment: true,
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
    const body: Partial<ElevatorRequestBody> = {
      address: formatAddressFullname(locationFormValues.address) as
        | AddressRecord
        | undefined,
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
        requiresAppointment:
          appointmentPreferenceFormValues.requiresAppointment,
      },
    };

    if (isSeparateAddressEnabled) {
      body.beneficiaryAddress = formatAddressFullname(
        separateAddressFormik.values.beneficiaryAddress,
      ) as AddressRecord | undefined;

      body.billingAddress = formatAddressFullname(
        separateAddressFormik.values.billingAddress,
      ) as AddressRecord | undefined;
    }

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

  // when customer id is passed to be prefilled
  useEffect(() => {
    if (prefilledCustomer) {
      setCustomer(prefilledCustomer);
      setActiveStep(1);
    }
  }, [prefilledCustomer]);

  if (isLoadingPrefillCustomer) {
    return <Progress />;
  }

  return (
    <Stepper
      initialActiveStep={activeStep}
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
      }}
      footerComponent={
        customer ? (
          <Box sx={{marginRight: '1em'}}>
            <Notes customerId={customer.id} />
          </Box>
        ) : undefined
      }>
      <FlexContainer
        containerStyle={{mt: '1em', overflowY: 'scroll', height: 0}}>
        {activeStep === 0 ? (
          <CustomerForm
            getCustomerFormErrors={(errors) => setCustomerFormError(errors)}
            getCustomerFormValues={(values) => setCustomerFormValues(values)}
            initialValues={customerFormValues}
            getCustomer={(item) => setCustomer(item)}
            initialCustomer={customer}
            shouldSetEmpty
          />
        ) : null}
        {activeStep === 1 ? (
          <LocationForm
            getLocationFormErrors={(errors) => setLocationFormError(errors)}
            getLocationFormValues={(values) => setLocationFormValues(values)}
            initialValues={locationFormValues}
            isSeparateAddressEnabled={isSeparateAddressEnabled}
            setIsSeparateAddressEnabled={(newBol: boolean) =>
              setIsSeparateAddressEnabled(newBol)
            }
            separateAddressFormik={separateAddressFormik}
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
