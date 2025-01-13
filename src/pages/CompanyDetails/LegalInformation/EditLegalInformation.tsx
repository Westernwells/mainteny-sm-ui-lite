import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import {FormInput} from 'components/form/FormInput';
import {Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {LegalInformationCompanyFormModel} from './model';

interface Props {
  formik: FormikProps<LegalInformationCompanyFormModel>;
}

export const EditLegalInformation = ({formik}: Props) => {
  const {t} = useTranslation();
  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <Grid container component="form" spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle2" color="primary.dark">
          {t('Represented by')}
        </Typography>
        <Typography variant="body2" color="textSecondary" pt={1}>
          {t('Choose one option to be displayed on the PDF files')}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {formik.values.representedBy === 'owner' && (
          <FormInput
            fieldProps={{
              size: 'small',
              name: 'owner',
              label: 'Owner',
              helperText: formik.touched.owner && formik.errors.owner,
              error: !!formik.errors.owner && formik.touched.owner,
              required: false,
              value: formik.values.owner,
              ...defaultProps,
            }}
          />
        )}
        {formik.values.representedBy === 'managingDirector' && (
          <FormInput
            fieldProps={{
              size: 'small',
              name: 'managingDirector',
              label: 'Managing Director',
              helperText:
                formik.touched.managingDirector &&
                formik.errors.managingDirector,
              error:
                !!formik.errors.managingDirector &&
                formik.touched.managingDirector,
              required: false,
              value: formik.values.managingDirector,
              ...defaultProps,
            }}
          />
        )}
      </Grid>

      <Grid xs={12} px={4} pt={2}>
        <RadioGroup
          name="representedBy"
          value={formik.values.representedBy}
          onChange={formik.handleChange}
          row>
          <FormControlLabel value="owner" control={<Radio />} label="Owner" />
          <FormControlLabel
            value="managingDirector"
            control={<Radio />}
            label="Managing director"
            sx={{ml: '3em'}}
          />
        </RadioGroup>
      </Grid>
      <Grid item xs={12}>
        <FormInput
          fieldProps={{
            size: 'small',
            placeholder: 'e.g. Berlin',
            label: 'Arbitration court',
            name: 'arbitrationCourt',
            helperText:
              formik.touched.arbitrationCourt && formik.errors.arbitrationCourt,
            error:
              !!formik.errors.arbitrationCourt &&
              formik.touched.arbitrationCourt,
            value: formik.values.arbitrationCourt,
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          fieldProps={{
            size: 'small',
            placeholder: 'e.g. HRB 151080 B, Charlottenburg',
            label: 'Trade registration number',
            name: 'tradeRegisterNumber',
            helperText:
              formik.touched.tradeRegisterNumber &&
              formik.errors.tradeRegisterNumber,
            error:
              !!formik.errors.tradeRegisterNumber &&
              formik.touched.tradeRegisterNumber,
            value: formik.values.tradeRegisterNumber,
            ...defaultProps,
          }}
        />
      </Grid>
    </Grid>
  );
};
