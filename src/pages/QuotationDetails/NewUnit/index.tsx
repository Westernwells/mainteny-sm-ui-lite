/* eslint-disable @typescript-eslint/no-unused-vars */
import {useEffect, useState} from 'react';
import {FormikErrors} from 'formik';
import MuiDialog, {DialogProps} from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {FlexContainer} from 'components/FlexContainer';
import {Stepper} from 'components/Stepper';
import {Priority} from 'models/service-order';
import {PropertyOwnerView} from 'models/propertyManager';
import {createEmptyResource} from 'utils/paging-utils';
import {useAddElevator, useAllElevators} from 'hooks/reactQuery/useElevator';
import {useFormatDate} from 'hooks/useFormatDate';
import {t} from 'i18next';
import {ElevatorStatus, ElevatorView} from 'models/elevator';
import {AddressRecord} from 'models/misc';
import {
  LocationFormModel,
  UnitDetailsFormModel,
  ServiceFormModel,
  AppointmentFormModel,
  AttachmentFormModel,
  PriorityTechnicianFormModel,
} from 'models/unitForm';
import {mapDaysOfWeekOptions} from 'pages/UnitDetails/Tabs/OverviewTab/AppointmentPreference/EditAppointmentForm';
import {formatAddressFullname, convertToMacro} from 'utils/utils';
import {QuotationView} from 'models/quotation';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {convertTechnicianArrayToWeights} from 'utils/elevator-utils';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {LocationForm} from './LocationForm';
import {UnitDetailsForm} from './UnitDetailsForm';
import {ServiceForm} from './ServiceForm';
import {AppointmentPreferenceForm} from './AppointmentPreferenceForm';
import {CustomerForm} from './CustomerForm';
import {PriorityEngineersForm} from './PriorityEngineersForm';
import {AttachmentForm} from './AttachmentForm';
import {T} from 'utils/i18n-utils';

const steps = [
  'Select customer',
  'Location',
  'Unit details',
  'Service info',
  'Appointment preferences',
  'Priority engineers',
  'Attachments',
];

interface Props {
  isDialogOpen: boolean;
  onClose: () => void;
  quotation?: QuotationView;
  onSave?: (customerId: string) => void;
  dialogProps?: DialogProps;
}

export const NewUnit = ({
  isDialogOpen,
  onClose,
  quotation,
  onSave,
  dialogProps,
}: Props) => {
  const formatDate = useFormatDate();
  const [activeStep, setActiveStep] = useState(0);
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  const [selectedCustomer, setSelectedCustomer] = useState<PropertyOwnerView>();
  const {data: uuid} = useUuid();

  const {mutateAsync: uploadFiles, isLoading: isUploading} = useUploadFiles(
    'Documents uploaded successfully',
  );

  const {mutateAsync: addNewUnit, isLoading: isSubmitting} = useAddElevator(
    'Unit created successfully',
  );

  const [attachmentFormError, setAttachmentFormError] = useState<
    FormikErrors<AttachmentFormModel>
  >({});

  const [attachmentFormValues, setAttachmentFormValues] =
    useState<AttachmentFormModel>({
      documents: [],
    });

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

  const [engineersFormError, setEngineersFormError] = useState<
    FormikErrors<{engineers: PriorityTechnicianFormModel[]}>
  >({});
  const [engineersFormValues, setEngineersFormValues] = useState<{
    engineers: PriorityTechnicianFormModel[];
  }>({
    engineers: [],
  });

  const [disableNextBtn, setDisableNextBtn] = useState(false);
  useEffect(() => {
    if (activeStep === 0 && !selectedCustomer) {
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

    if (activeStep === 5 && Object.keys(engineersFormError).length) {
      return setDisableNextBtn(true);
    }

    if (activeStep === 6 && Object.keys(attachmentFormError).length) {
      return setDisableNextBtn(true);
    }

    return setDisableNextBtn(false);
  }, [
    activeStep,
    selectedCustomer,
    attachmentFormError,
    locationFormError,
    unitDetailsFormError,
    serviceFormError,
    appointmentPreferenceFormError,
    engineersFormError,
  ]);

  const createNewUnit = async () => {
    const quotationId = uuid;
    const uploadPath = `${serviceCompanyId}/quotations/${
      quotation ? quotation.id : quotationId
    }/documents`;

    const body = {
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
      documents:
        attachmentFormValues.documents?.reduce<FileWithPreview[]>(
          (newArr: FileWithPreview[], obj) => [
            ...newArr,
            {
              ...obj,
              type: obj.type,
              uri: `${uploadPath}/${obj.name}`,
              description: obj.name.split('.')[0],
            },
          ],
          [],
        ) ?? [],
      emergencyContactNumber: unitDetailsFormValues.emergencyContactNumber,
      emergencyPhoneProvider: unitDetailsFormValues.emergencyPhoneProvider,
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
      propertyOwnerId: selectedCustomer?.id,
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
      technicianWeights: convertTechnicianArrayToWeights(
        engineersFormValues.engineers,
      ),
    };

    const response = await addNewUnit(body);
    if (
      attachmentFormValues.documents &&
      attachmentFormValues.documents.length
    ) {
      await uploadFiles({files: attachmentFormValues.documents, uploadPath});
    }
    if (response) {
      onSave?.(response.value);
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

  const handleCancel = () => {
    onClose();
    setSelectedCustomer(undefined);
  };

  return (
    <MuiDialog
      fullWidth
      maxWidth="lg"
      open={isDialogOpen}
      onClose={onClose}
      {...dialogProps}>
      <DialogTitle id="alert-dialog-title">{T('Create New Unit')}</DialogTitle>

      <DialogContent>
        <DialogContentText
          component="div"
          sx={{color: 'text.primary', pt: '0.5rem'}}>
          <Stepper
            handleCancel={handleCancel}
            handleSubmit={() => createNewUnit()}
            stepperWidth="100%"
            disableNextBtn={disableNextBtn || isSubmitting || isUploading}
            submitting={isSubmitting}
            getActiveStep={(val) => setActiveStep(val)}
            steps={steps}
            containerStyles={{
              flexGrow: 1,
              ml: '0',
              display: 'flex',
              flexDirection: 'column',
            }}
            submitLabel={t('Create Unit')}
            disableNavigateBack>
            <FlexContainer
              containerStyle={{
                mt: '1em',
                overflowY: 'hidden',
              }}>
              {activeStep === 0 ? (
                <CustomerForm
                  getSelectedCustomer={(val?: PropertyOwnerView) =>
                    setSelectedCustomer(val)
                  }
                  initialSelectedCustomer={selectedCustomer}
                />
              ) : null}
              {activeStep === 1 ? (
                <LocationForm
                  getLocationFormErrors={(errors) =>
                    setLocationFormError(errors)
                  }
                  getLocationFormValues={(values) =>
                    setLocationFormValues(values)
                  }
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
                  getServiceFormErrors={(errors) =>
                    setServicesFormError(errors)
                  }
                  getServiceFormValues={(values) =>
                    setServiceFormValues(values)
                  }
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
                  initialValues={appointmentPreferenceFormValues}
                />
              ) : null}

              {activeStep === 5 ? (
                <PriorityEngineersForm
                  getEngineersFormErrors={setEngineersFormError}
                  getEngineersFormValues={setEngineersFormValues}
                  initialValues={engineersFormValues}
                />
              ) : null}

              {activeStep === 6 ? (
                <AttachmentForm
                  initialValues={attachmentFormValues as AttachmentFormModel}
                  getAttachmentFormValues={(values) =>
                    setAttachmentFormValues(values)
                  }
                  getAttachmentFormErrors={(values) =>
                    setAttachmentFormError(values)
                  }
                />
              ) : null}
            </FlexContainer>
          </Stepper>
        </DialogContentText>
      </DialogContent>
    </MuiDialog>
  );
};

export default NewUnit;
