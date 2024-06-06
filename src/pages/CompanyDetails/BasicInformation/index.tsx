import {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {Avatar, Box, Typography} from '@mui/material';
import {
  LanguageOutlined,
  LocationOnOutlined,
  PhoneOutlined,
} from '@mui/icons-material';
import {Dialog} from 'components/Dialog';
import {Card} from 'components/Card';
import {CardDataListItem} from 'components/CardDataListItem';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {ServiceCompanyItem} from 'models/service-company';
import {phoneValidationRE} from 'pages/NewEmployee/BasicEmployeeForm';
import {useUpdateCompany} from 'hooks/reactQuery/useCompanies';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useUuid} from 'hooks/reactQuery/useUuid';
import {useUploadFiles} from 'hooks/reactQuery/useUploadSignedUrl';
import {formatAddressFullname} from 'utils/utils';
import {BasicInformationCompanyFormModel} from './model';
import {EditBasicInformation} from './EditBasicInformation';

interface Props {
  company: ServiceCompanyItem;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().nullable().required('name is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  phone: Yup.string().matches(phoneValidationRE, 'Phone number is not valid'),
});

export const BasicInformation = ({company}: Props) => {
  const [openDialog, setOpenDialog] = useState(false);

  const {mutateAsync: updateCompany, isLoading: isUpdating} = useUpdateCompany(
    'Company updated successfully',
  );
  const {mutateAsync: uploadImages, isLoading: isUploading} = useUploadFiles(
    'Image uploaded successfully',
  );

  const logoCompany = company?.settings?.whiteLabel?.logoPath;
  const {data: logoUrl = {}} = useDownloadUrl(
    logoCompany ? [logoCompany] : [],
    undefined,
    company.id,
  );

  const formik = useFormik<BasicInformationCompanyFormModel>({
    initialValues: {
      name: company?.name || '',
      email: company?.contact?.email || '',
      phone: company?.contact?.phone.split('+')[1] || company?.contact?.phone,
      url: company?.contact?.url || '',
      logoUrl: logoUrl[logoCompany] || '',
      logoFile: null as unknown as FileWithPreview,
      billingAddress: company.billingAddress ? company.billingAddress : null,
      businessAddress: company.businessAddress ? company.businessAddress : null,
      postalAddress: company.postalAddress ? company.postalAddress : null,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const {data: uuid} = useUuid();
  const uploadPath = `${company.id}/whiteLabel/${uuid}`;

  const onSave = async () => {
    const file = formik.values.logoFile as unknown as FileWithPreview;
    const photoUrl = `${uploadPath}/${file?.name}`;

    // If file type is File object, upload it
    if (!!file && typeof file !== 'string') {
      await uploadImages({
        files: [file] || [],
        uploadPath,
      });
    }

    await updateCompany({
      body: {
        name: formik.values.name,
        email: formik.values.email,
        phone: `+${formik.values.phone.replaceAll('+', '')}`,
        url: formik.values.url,
        whiteLabel: {
          logoPath: photoUrl,
        },
        billingAddress: {
          ...formik.values.billingAddress,
          fullName:
            formatAddressFullname(formik.values?.billingAddress)?.fullName ||
            '',
        },
        businessAddress: {
          ...formik.values.businessAddress,
          fullName:
            formatAddressFullname(formik.values?.businessAddress)?.fullName ||
            '',
        },
        postalAddress: {
          ...formik.values.postalAddress,
          fullName:
            formatAddressFullname(formik.values?.postalAddress)?.fullName || '',
        },
      },
      companyId: company?.id || '',
    });

    setOpenDialog(false);
  };

  useEffect(() => {
    formik.setFieldValue('logoUrl', logoUrl[logoCompany]);
  }, [logoUrl[logoCompany]]);

  useEffect(() => {
    formik.validateForm();
  }, []);

  return (
    <>
      <Card title="Basic" actionHandler={() => setOpenDialog(true)}>
        <Box display="flex" alignItems="center" gap={2} pb={3}>
          <Avatar
            alt={company?.name}
            src={logoUrl[logoCompany]}
            sx={{width: 80, height: 80}}
          />
          <Box display="flex" flexDirection="column">
            <Typography variant="h6">{company.name}</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {company.contact.email}
            </Typography>
          </Box>
        </Box>
        <CardDataListItem
          label="Phone"
          value={`+${company?.contact.phone.replaceAll('+', '')}`}
          Icon={PhoneOutlined}
        />
        <Box pt={0.75} pb={3}>
          <CardDataListItem
            label="Website"
            value={company.contact.url}
            Icon={LanguageOutlined}
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={0.75}>
          <CardDataListItem
            label="Billing address"
            value={company.billingAddress?.fullName || '-'}
            Icon={LocationOnOutlined}
          />
          <CardDataListItem
            label="Business address"
            value={company.businessAddress?.fullName || '-'}
            Icon={LocationOnOutlined}
          />
          <CardDataListItem
            label="Postal address"
            value={company.postalAddress?.fullName || '-'}
            Icon={LocationOnOutlined}
          />
        </Box>
      </Card>

      <Dialog
        title="Edit Basic info"
        saveBtnType="submit"
        onCancel={() => setOpenDialog(false)}
        onSave={() => onSave()}
        saveButtonText="Save Changes"
        disableSaveBtn={
          !!Object.keys(formik.errors).length || isUpdating || isUploading
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
        <EditBasicInformation formik={formik} />
      </Dialog>
    </>
  );
};
