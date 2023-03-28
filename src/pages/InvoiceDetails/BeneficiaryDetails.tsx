import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {FormInput} from 'components/form/FormInput';
import {useTranslation} from 'react-i18next';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {FormikProps} from 'formik';
import {InvoiceFormData} from 'models/invoice';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from 'components/Accordions/Accordion';

interface Props {
  formik: FormikProps<InvoiceFormData>;
}

export const BeneficiaryDetails = ({formik}: Props) => {
  const {t} = useTranslation();
  return (
    <Box>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header">
          <Typography color="grey.700">{t('Beneficiary details')}</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{display: 'flex', justifyContent: 'space-between'}}>
          <FormInput
            props={{
              value: formik.values.beneficialName,
              onChange: formik.handleChange,
              label: 'Name',
              name: 'beneficialName',
              sx: {mr: 4},
            }}
          />

          <AddressAutoComplete
            initialValue={formik.values.beneficialAddress?.fullName || ''}
            textFieldProps={{
              name: 'beneficialAddress',
              placeholder: '',
            }}
            label="Address"
            getAddress={(address) =>
              formik.setFieldValue('beneficialAddress', address)
            }
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
