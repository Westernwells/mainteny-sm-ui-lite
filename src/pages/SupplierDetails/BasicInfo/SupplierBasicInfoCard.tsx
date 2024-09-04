import {useEffect, useState} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Create';
import Typography from '@mui/material/Typography';
import {Grid} from '@mui/material';
import {
  Email,
  Language,
  LensOutlined,
  LocationOn,
  Phone,
  TagRounded,
} from '@mui/icons-material';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import {phoneValidationRE} from 'pages/NewEmployee/BasicEmployeeForm';
import {Dialog} from 'components/Dialog';
import {
  useQueryArticleSuppliers,
  useUpdateSupplier,
} from 'hooks/reactQuery/useArticle';
import {CardProps} from 'components/CardProps';
import {InfoCard} from 'components/InfoCard';
import {createEmptyResource, makePage} from 'utils/paging';
import {EditBasicInfoForm} from './EditBasicInfoForm';
import {
  ArticleSupplierView,
  UpdateArticleSupplierRecord,
} from '../../../models/supplier';

const isExternalIdUnique = async (
  resource: ArticleSupplierView[],
  value?: string,
) => {
  if (!value) {
    return true;
  }
  try {
    return !(resource && resource.some((item) => item.externalId === value));
  } catch (error) {
    console.error('Error checking externalId uniqueness:', error);
    return true;
  }
};

export const SupplierBasicInfoCard = ({
  supplier,
}: {
  supplier: ArticleSupplierView;
}) => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const {mutateAsync: updateArticle, isLoading} = useUpdateSupplier(
    'Supplier details updated successfully!',
  );

  const [initValue, setInitValue] = useState('');
  const [updatedValue, setUpdatedValue] = useState('');

  const {
    data: articleSupplierResource = createEmptyResource<ArticleSupplierView>(
      25,
    ),
  } = useQueryArticleSuppliers(
    {...makePage(0, 50), query: updatedValue ?? ''},
    {
      keepPreviousData: true,
    },
  );

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    externalId: Yup.string()
      .nullable()
      .required('External Id is required')
      .test(
        'checkExternalId',
        'This ID is already taken. Please enter a different one.',
        async (value) => {
          if (value !== initValue) {
            return isExternalIdUnique(articleSupplierResource.data, value!);
          }
          return true;
        },
      ),
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
    phone: Yup.string()
      .required('Phone number is required')
      .matches(phoneValidationRE, 'Phone number is not valid'),
    address: Yup.object().nullable().required('Address is required'),
    url: Yup.string().nullable(),
    category: Yup.string().nullable(),
  });

  const formik = useFormik<UpdateArticleSupplierRecord>({
    initialValues: {
      name: supplier.name,
      externalId: supplier.externalId,
      email: supplier.contact.email,
      phone: supplier.contact.phone,
      address: supplier.address,
      url: supplier.contact.url,
      category: supplier.category,
    },
    onSubmit: (values) => {
      updateArticle(
        {
          id: supplier!.id,
          supplier: {
            name: values.name,
            externalId: values.externalId,
            email: values.email,
            phone: values.phone,
            address: values.address,
            url: values.url,
            category: values.category,
          },
        },
        {
          onSuccess: () => setOpenDialog(false),
        },
      );
    },
    validationSchema,
  });

  useEffect(() => {
    setInitValue(formik.values.externalId!);
  }, []);

  useEffect(() => {
    setUpdatedValue(formik.values.externalId!);
  }, [formik]);

  const handleCancel = () => {
    formik.resetForm();
    setOpenDialog(false);
  };
  const basicInfoItems = [
    {
      label: 'id',
      icon: <TagRounded sx={{color: theme.palette.info.main}} />,
      body: supplier?.externalId ?? '-',
    },
    {
      label: 'Email',
      icon: <Email sx={{color: theme.palette.info.main}} />,
      body: supplier?.contact.email ?? '-',
    },
    {
      label: 'Phone',
      icon: <Phone sx={{color: theme.palette.info.main}} />,
      body: supplier?.contact.phone ?? '-',
    },
    {
      label: 'Website',
      icon: <Language sx={{color: theme.palette.info.main}} />,
      body: supplier?.contact.url || '-',
    },
    {
      label: 'Category',
      icon: <LensOutlined sx={{color: theme.palette.info.main}} />,
      body: supplier?.category || '-',
    },
    {
      label: 'Address',
      icon: <LocationOn sx={{color: theme.palette.info.main}} />,
      body: supplier?.address?.fullName ?? '-',
    },
  ];

  return (
    <InfoCard
      containerStyles={{mb: '1.2rem'}}
      headerActionIcon={<EditIcon />}
      handleAction={() => setOpenDialog(true)}
      showHeaderBackground
      header={<Typography variant="subtitle1">{supplier?.name}</Typography>}>
      <Grid container flexWrap="wrap" spacing={2}>
        {basicInfoItems.map((item, key) => (
          <Grid item xs={3} key={key}>
            <CardProps
              label={item.label}
              labelStyle={{textTransform: 'uppercase'}}
              icon={item.icon}
              iconBackground={theme.palette.info.outlinedHoverBg}
              bodyText={item.body}
            />
          </Grid>
        ))}
      </Grid>
      <Dialog
        title="Edit Basic Information"
        isSaving={isLoading}
        onCancel={handleCancel}
        disableSaveBtn={!formik.isValid || !formik.dirty}
        onSave={formik.handleSubmit}
        dialogProps={{
          open: openDialog,
        }}>
        <EditBasicInfoForm formik={formik} />
      </Dialog>
    </InfoCard>
  );
};
