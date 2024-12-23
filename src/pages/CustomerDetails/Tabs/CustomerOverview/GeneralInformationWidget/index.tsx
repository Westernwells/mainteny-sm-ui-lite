import {Avatar, Box, Typography} from '@mui/material';
import {Card} from 'components/Card';
import {CardDataListItem} from 'components/CardDataListItem';
import {PropertyOwnerView} from 'models/propertyManager';
import {useState} from 'react';
import {
  CallOutlined,
  LanguageOutlined,
  LocationOnOutlined,
  LowPriorityOutlined,
  RequestPageOutlined,
} from '@mui/icons-material';
import {Dialog} from 'components/Dialog';
import {useForm} from 'react-hook-form';
import {CustomerGeneralInformationFormModel} from 'models/customer';
import {useCustomer} from 'hooks/reactQuery/useCustomers';
import {ReactComponent as TwoPin} from 'assets/illustrations/TwoPin.svg';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {t} from 'i18next';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {CustomTranslationOptions} from 'pages/CompanyDetails/BasicInformation';
import {useTranslation} from 'react-i18next';
import {formatAddressFullname} from 'utils/utils';
import {companyLanguageContextMap} from 'utils/language';
import EditCustomerGeneralInformation from './EditCustomerGeneralInformation';

type Props = {
  customer: PropertyOwnerView;
};

const GeneralInformationWidget = ({customer}: Props) => {
  const {user} = useUserSession();
  const {data: uuid} = useUuid();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';

  const {data: company} = useCompanyById(customer?.serviceCompany?.id);

  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const [openDialog, setOpenDialog] = useState(false);

  const {updateCustomer, isLoading: isUpdating} = useCustomer(true);

  const {mutateAsync: uploadImages, isLoading: isUploading} = useUploadFiles(
    'Image uploaded successfully',
  );

  const {data: logoUrl = {}} = useDownloadUrl(
    customer?.additionalInfo.customerImagePath
      ? [customer?.additionalInfo?.customerImagePath]
      : [],
    undefined,
    serviceCompanyId,
  );

  const uploadPath = `${serviceCompanyId}/customers/${uuid}`;

  const {handleSubmit, control, setValue, watch, reset, formState} = useForm({
    mode: 'onChange',
    defaultValues: {
      name: customer.name || '',
      externalId: customer.externalId || '',
      priority: customer.additionalInfo.priority || '',
      url: customer.contact.url || '',
      customerImagePath: customer.additionalInfo?.customerImagePath || '',
      logoFile: null as FileWithPreview | null,
      phone: customer.contact.phone || '',
      email: customer.contact.email || '',
      secondaryPhoneNumber: customer.additionalInfo?.secondaryPhoneNumber || '',
      vatId: customer.additionalInfo.vatId || '',
      postalAddress: customer.postalAddress || null,
      businessAddress: customer.businessAddress || null,
    },
  });

  const {errors} = formState;

  const onSave = async (data: CustomerGeneralInformationFormModel) => {
    const file = watch('logoFile') as unknown as FileWithPreview;
    const photoUrl = `${uploadPath}/${file?.name}`;

    if (!!file && typeof file !== 'string') {
      await uploadImages({
        files: [file],
        uploadPath,
      });
    }

    const payload = {
      name: data.name,
      externalId: data.externalId,
      priority: data.priority,
      secondaryPhoneNumber: data.secondaryPhoneNumber,
      vatId: data.vatId,
      contact: {
        phone: data.phone,
        email: data.email,
        url: data.url,
      },
      customerImagePath: watch('logoFile')
        ? photoUrl
        : customer.additionalInfo.customerImagePath,
      businessAddress: data.businessAddress
        ? {
            ...data.businessAddress,
            component: {
              ...data.businessAddress?.component,
              country: data.businessAddress?.component?.country
                ? translateCompanyLanguage(
                    data.businessAddress.component.country,
                  )
                : '',
            },
            fullName:
              formatAddressFullname(
                data.businessAddress,
                translateCompanyLanguage,
              )?.fullName || '',
          }
        : null,
      postalAddress: data.postalAddress
        ? {
            ...data.postalAddress,
            component: {
              ...data.postalAddress?.component,
              country: data.postalAddress?.component?.country
                ? translateCompanyLanguage(data.postalAddress.component.country)
                : '',
            },
            fullName:
              formatAddressFullname(
                data.postalAddress,
                translateCompanyLanguage,
              )?.fullName || '',
          }
        : null,
    };

    await updateCustomer(payload, customer.id, () => {
      setOpenDialog(false);

      reset({
        name: payload.name || '',
        externalId: payload.externalId || '',
        priority: payload.priority || '',
        url: payload.contact.url || '',
        customerImagePath: payload.customerImagePath || '',
        logoFile: null,
        phone: payload.contact.phone || '',
        email: payload.contact.email || '',
        secondaryPhoneNumber: payload.secondaryPhoneNumber || '',
        vatId: payload.vatId || '',
        postalAddress: payload.postalAddress || null,
        businessAddress: payload.businessAddress || null,
      });
    });
  };

  return (
    <>
      <Card
        title="General Info"
        actionHandler={() => setOpenDialog(true)}
        containerProps={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          px: 3,
        }}
        Icon={TwoPin}>
        <Box display="flex" alignItems="center" gap={2} pb={3}>
          <Avatar
            alt={customer?.name}
            src={logoUrl[customer?.additionalInfo.customerImagePath!]}
            sx={{width: 80, height: 80}}
          />
          <Box display="flex" flexDirection="column">
            <Typography variant="h6">{customer.name || '-'}</Typography>

            {customer.contact.email ? (
              <Typography
                variant="subtitle2"
                color="#0092B2"
                component="a"
                href={`mailto:${customer.contact.email}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{textDecoration: 'none'}}>
                {customer.contact.email}
              </Typography>
            ) : (
              <Typography variant="subtitle2" color="text.secondary">
                -
              </Typography>
            )}
            <Typography variant="subtitle2" color="text.secondary">
              {customer.externalId || '-'}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap={0.75}>
          <CardDataListItem
            label="Business Address"
            value={customer?.businessAddress?.fullName || '-'}
            Icon={LocationOnOutlined}
          />

          <CardDataListItem
            label="Postal Address"
            value={customer?.postalAddress?.fullName || '-'}
            Icon={LocationOnOutlined}
          />

          <CardDataListItem
            label="VAT ID"
            value={customer?.additionalInfo.vatId || '-'}
            Icon={RequestPageOutlined}
          />

          <CardDataListItem
            label="Phone"
            value={customer?.contact.phone || '-'}
            Icon={CallOutlined}
          />

          <CardDataListItem
            label="2nd Phone"
            value={customer?.additionalInfo.secondaryPhoneNumber || '-'}
            Icon={CallOutlined}
          />

          <CardDataListItem
            label="Website/URL"
            value={customer?.contact.url || '-'}
            Icon={LanguageOutlined}
          />

          <CardDataListItem
            label="Priority"
            value={t(customer?.additionalInfo.priority) || '-'}
            Icon={LowPriorityOutlined}
          />
        </Box>
      </Card>
      <Dialog
        title="General Info"
        saveBtnType="submit"
        onCancel={() => {
          setOpenDialog(false);
          reset();
        }}
        onSave={handleSubmit(onSave)}
        saveButtonText="Save Changes"
        disableSaveBtn={
          !!Object.keys(errors).length ||
          !watch('name') ||
          isUploading ||
          isUpdating
        }
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}
        dialogContentStyles={{
          mx: 0,
          mt: 0,
          px: 3,
        }}>
        <EditCustomerGeneralInformation
          customer={customer}
          control={control}
          errors={errors}
          setValue={setValue}
          watch={watch}
        />
      </Dialog>
    </>
  );
};

export default GeneralInformationWidget;
