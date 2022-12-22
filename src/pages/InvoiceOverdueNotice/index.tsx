import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import * as Yup from 'yup';
import {useFormik} from 'formik';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {PageCard} from 'components/PageCard';
import {FormLabel} from 'components/form/FormLabel';
import {FormInput} from 'components/form/FormInput';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {BottomDrawer} from 'components/BottomDrawer';
import {useMemo} from 'react';
import Cancel from '@mui/icons-material/Cancel';
import Print from '@mui/icons-material/Print';
import {Button} from 'components/Button';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';

const validationSchema = Yup.object().shape({
  customerAddress: Yup.string().required('Customer Address is required'),
  invoiceNumber: Yup.number().required('Invoice number is required'),
  subject: Yup.string().required('Subject is required'),
  description: Yup.string().required('Description is required'),
});

export const InvoiceOverdueNotice = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {user} = useUserSession();
  const navigate = useNavigate();

  const initialValues = {
    customerAddress: '',
    invoiceNumber: 0,
    subject: '',
    description: '',
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    // TODO: handle onSubmit
    onSubmit: (values) =>
      console.log(
        '🚀 ~ file: index.tsx:56 ~ InvoiceOverdueNotice ~ values',
        values,
      ),
  });

  const actions = useMemo(() => {
    const items = [
      {
        label: t('Cancel'),
        icon: <Cancel />,
        onClick: () => navigate(-1),
      },
    ];
    items.unshift({
      label: t('Print'),
      icon: <Print />,
      // TODO: handle print
      onClick: () => console.log('print....'),
    });
    return items;
  }, []);

  return (
    <>
      <PageCard
        containerStyles={{
          mb: '5rem',
          mt: '1.5rem',
          width: '100%',
          maxWidth: '50rem',
          alignSelf: 'center',
        }}
        contentContainerStyles={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
        <Typography variant="h6">Overdue notice</Typography>
        <Box>
          <FormLabel text={t('From')} />
          <Box
            display="flex"
            bgcolor="grey.200"
            alignItems="start"
            justifyContent="space-between"
            mt="0.5rem"
            px="0.75rem"
            py=".5rem"
            border="1px solid"
            borderColor="inputBackground.main"
            borderRadius="4px">
            <Box>
              <Typography variant="h6">
                {user?.userAccount.serviceCompany.name || ''}
              </Typography>
              <Box>
                {user &&
                'businessAddress' in user.userAccount.serviceCompany &&
                user.userAccount.serviceCompany.postalAddress?.fullName ? (
                  <Typography variant="caption">
                    {user.userAccount.serviceCompany.postalAddress?.fullName}
                  </Typography>
                ) : (
                  ''
                )}
              </Box>
            </Box>
          </Box>
        </Box>
        <FormInput
          props={{
            name: 'customerAddress',
            label: t('Customer Address'),
            placeholder: t(
              'e.g. 2118 Thornridge Cir. Syracuse, Connecticut 35624',
            ),
            variant: 'outlined',
            value: formik.values.customerAddress,
            error: !!(
              formik.touched.customerAddress && formik.errors.customerAddress
            ),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            required: true,
          }}
        />
        <FormInput
          props={{
            name: 'invoiceNumber',
            label: t('Invoice number'),
            type: 'number',
            variant: 'outlined',
            value: formik.values.invoiceNumber,
            error: !!(
              formik.touched.invoiceNumber && formik.errors.invoiceNumber
            ),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            required: true,
          }}
        />
        <FormInput
          props={{
            name: 'subject',
            label: t('Subject'),
            placeholder: t('e.g. Late payment'),
            variant: 'outlined',
            value: formik.values.subject,
            error: !!(formik.touched.subject && formik.errors.subject),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            required: true,
          }}
        />
        <FormInput
          props={{
            name: 'description',
            label: t('Description'),
            placeholder: t(
              'e.g. The invoice is overdue [XX] days. Hearby we remind you to please pay the outstanding amount.',
            ),
            variant: 'outlined',
            value: formik.values.description,
            error: !!(formik.touched.description && formik.errors.description),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            required: true,
            multiline: true,
            rows: 6,
          }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">{t('Initial amount')}</Typography>
          <FormInput
            containerStyles={{width: '120px'}}
            props={{
              name: 'initialAmount',
              variant: 'outlined',
              value: '€38,900',
              disabled: true,
              sx: {
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: theme.palette.text.primary,
                  textAlign: 'end',
                },
              },
            }}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2">{t('Handling fee')}</Typography>
          <FormInput
            containerStyles={{width: '120px'}}
            props={{
              name: 'handlingFee',
              variant: 'outlined',
              value: '€20,00',
              disabled: true,
              sx: {
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: theme.palette.text.primary,
                  textAlign: 'end',
                },
              },
            }}
          />
        </Box>

        <Box
          bgcolor="grey.700"
          borderRadius="4px"
          p="0.75rem"
          display="flex"
          justifyContent="space-between">
          <Typography sx={{color: 'primary.contrastText'}}>
            {t('Total amount')}
            <Typography variant="caption" component="span" ml="1ch">
              {t('(incl VAT)')}
            </Typography>
          </Typography>
          <Typography sx={{color: 'primary.contrastText'}}>€38,920</Typography>
        </Box>
      </PageCard>

      <BottomDrawer
        isOpen
        primaryButtonLabel={t('Send')}
        primaryButtonAction={formik.handleSubmit}
        listItems={actions.map((item) => ({
          ...item,
          showBorder: actions[actions.length - 1] !== item,
        }))}
        isValid={formik.isValid}
        secondaryButton={
          <Button
            label="Preview"
            buttonProps={{
              variant: 'outlined',
              sx: {bgcolor: theme.palette.inputBackground.main},
              startIcon: <RemoveRedEye />,
              size: 'medium',
              // TODO: handle preview
              onClick: () => console.log('preview...'),
            }}
          />
        }
      />
    </>
  );
};
