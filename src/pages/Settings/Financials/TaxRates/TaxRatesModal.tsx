import {useState} from 'react';
import {
  Box,
  Grid2 as Grid,
  IconButton,
  InputAdornment,
  Tooltip,
  Typography,
} from '@mui/material';
import {InfoOutlined} from '@mui/icons-material';
import {theme} from 'theme';
import {t} from 'i18next';
import {UseFormReturn} from 'react-hook-form';
import {FormInput} from 'components/form/FormInput';
import {FormLabel} from 'components/form/FormLabel';
import {Switch} from 'components/Switch';
import {VatView} from 'models/vat';

interface Props {
  form: UseFormReturn<VatView>;
}

const FormLabel2 = ({label}: {label: string}) => (
  <FormLabel
    text={label}
    sx={{
      typography: 'subtitle2',
      color: 'primary.dark',
      pb: 0.5,
      display: 'block',
      textTransform: 'none',
    }}
  />
);

const FormLabelWithTooltip = ({
  label,
  tooltipText,
}: {
  label: string;
  tooltipText: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box display="flex" alignItems="center">
      <FormLabel2 label={label} />
      <Tooltip
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        title={t(tooltipText)}
        placement="top"
        arrow>
        <IconButton
          sx={{
            color: isOpen ? 'action.active' : 'text.secondary',
            p: 0,
            pb: 1,
            ml: 0.5,
          }}>
          <InfoOutlined fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export const TaxRatesModal = ({form}: Props) => (
  <Grid container component="form" spacing={1.5}>
    <Grid size={8}>
      <FormLabel2 label="Name" />
      <FormInput
        fieldProps={{
          size: 'small',
          required: true,
          ...form.register('name', {required: true}),
        }}
      />
    </Grid>

    <Grid size={4}>
      <FormLabel2 label="Tax rate" />
      <FormInput
        fieldProps={{
          type: 'number',
          size: 'small',
          required: true,
          sx: {
            '& .MuiInputBase-root': {
              pr: 0,
            },
          },
          slotProps: {
            input: {
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{
                    p: 1.5,
                    borderLeft: `1px solid ${theme.palette.grey[200]}`,
                  }}>
                  <Typography variant="body1" color="primary.dark">
                    %
                  </Typography>
                </InputAdornment>
              ),
            },
          },
          ...form.register('percentage', {required: true}),
        }}
      />
    </Grid>

    <Grid size={12}>
      <FormLabelWithTooltip
        label="Legal note"
        tooltipText="If a legal note is present here and you choose this tax rate, the text automatically appears in the note section of each quotation and invoice for editing."
      />
      <FormInput
        fieldProps={{
          multiline: true,
          minRows: 4,
          size: 'small',
          ...form.register('legalNote'),
        }}
      />
    </Grid>

    <Grid size={12}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <FormLabelWithTooltip
          label="Default tax rate"
          tooltipText="This is the standard tax percentage applied automatically if no specific rate is set."
        />
        <Switch
          value={form.getValues('isDefault')}
          onChanged={(v) => form.setValue('isDefault', v)}
        />
      </Box>
    </Grid>
  </Grid>
);
