import {useEffect, useState} from 'react';
import {PropertyOwnerView} from 'models/propertyManager';
import {Dialog} from 'components/Dialog';
import {Box, Typography} from '@mui/material';
import {EmptyServicesSection} from 'components/EmptyServicesSection';
import {
  ContractTimeUnit,
  ContractServiceForm,
  ExtendedContractComponentRecord,
} from 'models/contract';
import {theme} from 'theme';
import {FormikProps, useFormik} from 'formik';
import {ArticleType} from 'models/article';
import {Button} from 'components/Button';
import {useTranslation} from 'react-i18next';
import {useMultipleElevators} from 'hooks/reactQuery/useElevator';
import {useUuid} from 'hooks/reactQuery/useUuid';
import * as Yup from 'yup';
import ServiceInformationReview from './ServiceInformationReview';
import ServiceListing from './ServiceListing';
import ServicesForm from './ServicesForm';

interface Props {
  elevatorUnits: string[];
  formik: FormikProps<{components: ExtendedContractComponentRecord[]}>;
  getSelectedCustomer: (val?: PropertyOwnerView) => void;
  initialSelectedCustomer?: PropertyOwnerView;
}

export const NewContractServices = ({
  elevatorUnits,
  formik,
  getSelectedCustomer,
  initialSelectedCustomer,
}: Props) => {
  const {t} = useTranslation();

  const [isEditForm, setIsEditForm] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedCustomer] = useState<PropertyOwnerView | undefined>(
    initialSelectedCustomer,
  );

  const {data} = useMultipleElevators(elevatorUnits);
  const {data: uuid, refetch: refetchUniqueId} = useUuid();

  const formikContractServiceInitialValues: ContractServiceForm = {
    isChecked: false,
    id: uuid,
    name: '',
    group: '',
    firstInvoiceDate: null,
    firstOrderDate: null,
    costType: ArticleType.LABOR,
    costPackage: {
      laborPercentage: 0,
      materialPercentage: 0,
    },
    isAutomaticJobCycle: false,
    elevators:
      data
        ?.map((item) => item.data)
        .map((item) => ({
          elevatorId: item.id,
          externalId: item.externalId,
          invoiceJob: {timeUnit: ContractTimeUnit.MONTHLY, timeNumbers: []},
          orderGenerationJob: {
            timeUnit: ContractTimeUnit.MONTHLY,
            timeNumbers: [],
          },
          price: 0,
          buildingLocation: item.additionalInfo?.buildingLocation || '-',
          address: item.address?.fullName || '-',
          isSelected: true,
        })) || [],
  };

  const validationSchemaContractServices = Yup.object().shape({
    name: Yup.string().required('Service name cannot be empty'),
    firstInvoiceDate: Yup.date()
      .nullable()
      .required('First invoice date is required'),
  });

  const formikContractServiceComponent = useFormik<ContractServiceForm>({
    initialValues: formikContractServiceInitialValues,
    onSubmit: () => {},
    validationSchema: validationSchemaContractServices,
    validateOnMount: true,
    validateOnChange: true,
  });

  useEffect(() => {
    if (data && !formikContractServiceComponent.values.elevators.length) {
      formikContractServiceComponent.setFieldValue(
        'elevators',
        data
          ?.map((item) => item.data)
          .map((item) => ({
            elevatorId: item.id,
            externalId: item.externalId,
            invoiceJob: {timeUnit: ContractTimeUnit.NONE, timeNumbers: []},
            orderGenerationJob: {
              timeUnit: ContractTimeUnit.NONE,
              timeNumbers: [],
            },
            price: 0,
            buildingLocation: item.additionalInfo?.buildingLocation || '-',
            address: item.address?.fullName || '-',
            isSelected: true,
          })) || [],
      );
    }
  }, [data, elevatorUnits.length]);

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    refetchUniqueId();
  }, [isDialogOpen]);

  useEffect(() => {
    if (getSelectedCustomer) {
      getSelectedCustomer(selectedCustomer);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    const defaultPackageValues = {
      laborPercentage:
        formikContractServiceComponent.values.costType === ArticleType.PACKAGE
          ? formikContractServiceComponent.values.costPackage
              ?.laborPercentage || 50
          : 0,
      materialPercentage:
        formikContractServiceComponent.values.costType === ArticleType.PACKAGE
          ? formikContractServiceComponent.values?.costPackage
              ?.materialPercentage || 50
          : 0,
    };
    formikContractServiceComponent.setFieldValue('costPackage', {
      ...formikContractServiceComponent.values.costPackage,
      ...defaultPackageValues,
    });
  }, [formikContractServiceComponent.values.costType]);

  return (
    <>
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Box>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {t(
              'Define the contract services that you want to provide for your customers.',
            )}
          </Typography>
          <Typography
            variant="body2"
            color={theme.palette.text.secondary}
            py={0.5}>
            {t('All added service will be added to the invoice.')}
          </Typography>
        </Box>
        {formik.values.components.length !== 0 && (
          <Box>
            <Button
              label="Add Service"
              buttonProps={{
                onClick: () => setIsDialogOpen(true),
                variant: 'contained',
                size: 'large',
              }}
            />
          </Box>
        )}
      </Box>

      {formik.values.components.length === 0 && (
        <EmptyServicesSection
          showActionBtn
          btnLabel="Add Service"
          btnAction={() => setIsDialogOpen(true)}
          containerStyle={{
            height: '100%',
            mb: '10em',
          }}
        />
      )}

      <Dialog
        title={isEditForm ? t('Edit Service') : t('Add Service')}
        onCancel={() => {
          handleCancel();
          formikContractServiceComponent.resetForm({
            values: formikContractServiceInitialValues,
          });
          setIsEditForm(false);
        }}
        dialogProps={{
          open: isDialogOpen || false,
          maxWidth: 'lg',
        }}
        disableSaveBtn={
          !!Object.keys(formikContractServiceComponent.errors).length ||
          (formikContractServiceComponent.values.isAutomaticJobCycle &&
            !formikContractServiceComponent.values.firstOrderDate) ||
          (formikContractServiceComponent.values.isAutomaticJobCycle &&
            !formikContractServiceComponent.values.orderType)
        }
        saveButtonText={isEditForm ? t('Save') : t('Add Service')}
        onSave={() => {
          const existingComponentIndex = formik.values.components.findIndex(
            (component) =>
              component.id === formikContractServiceComponent.values.id,
          );

          if (existingComponentIndex !== -1) {
            formik.setFieldValue('components', [
              ...formik.values.components.slice(0, existingComponentIndex),
              {
                ...formikContractServiceComponent.values,
                elevators: formikContractServiceComponent.values.elevators.map(
                  (item) => ({
                    ...item,
                    orderGenerationJob: !formikContractServiceComponent.values
                      .isAutomaticJobCycle
                      ? {
                          timeUnit: ContractTimeUnit.NONE,
                          timeNumbers: [],
                        }
                      : {...item.orderGenerationJob},
                  }),
                ),
              },
              ...formik.values.components.slice(existingComponentIndex + 1),
            ]);
          } else {
            formik.setFieldValue('components', [
              ...formik.values.components,
              formikContractServiceComponent.values,
            ]);
          }

          setIsDialogOpen(false);

          formikContractServiceComponent.resetForm({
            values: formikContractServiceInitialValues,
          });
        }}>
        <ServicesForm
          formikContractServiceComponent={formikContractServiceComponent}
          isDialogOpen={isDialogOpen}
        />
      </Dialog>

      {formik.values.components.length !== 0 && (
        <ServiceListing
          formik={formik}
          formikContractServiceComponent={formikContractServiceComponent}
          handleDeleteDialogOpen={() => setIsDeleteDialogOpen(true)}
          handleDeleteDialogClose={() => setIsDeleteDialogOpen(false)}
          handleEditDialog={() => {
            setIsDialogOpen(true);
            setIsEditForm(true);
          }}
          handleReviewDialog={() => setIsReviewDialogOpen(true)}
          isDeleteDialogOpen={isDeleteDialogOpen}
        />
      )}

      {/* LISTING REVIEW */}
      <Dialog
        title={t('Service Information')}
        onCancel={() => {
          setIsReviewDialogOpen(false);
          formikContractServiceComponent.resetForm({
            values: formikContractServiceInitialValues,
          });
        }}
        dialogProps={{
          open: isReviewDialogOpen || false,
          maxWidth: 'lg',
        }}
        saveButtonText={t('Edit Service')}
        onSave={() => {
          setIsReviewDialogOpen(false);
          setIsDialogOpen(true);
          setIsEditForm(true);
        }}
        leftButton={
          <Button
            label="Close"
            buttonProps={{
              onClick: () => setIsReviewDialogOpen(false),
              variant: 'text',
              size: 'large',
              sx: {background: 'white'},
            }}
          />
        }
        saveButtonVariant="outlined"
        showCancelButton={false}>
        <ServiceInformationReview
          formikContractServiceComponent={formikContractServiceComponent}
        />
      </Dialog>
    </>
  );
};
