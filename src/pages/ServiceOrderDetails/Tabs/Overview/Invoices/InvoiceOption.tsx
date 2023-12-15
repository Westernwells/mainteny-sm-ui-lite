import {Grid, FormControlLabel, Typography} from '@mui/material';
import {Box} from '@mui/system';
import {InvoiceType} from 'models/invoice';
import {ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';

interface OptionProps {
  label: string;
  description: string;
  icon: ReactElement;
  invoiceType: InvoiceType;
  activeValue: InvoiceType | null;
  handleClick: any;
}

const InvoiceOption = ({
  label,
  description,
  icon,
  invoiceType,
  activeValue,
  handleClick,
}: OptionProps) => {
  const {t} = useTranslation();
  const theme = useTheme();
  return (
    <Grid
      tabIndex={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        color:
          activeValue === invoiceType
            ? theme.palette.inputBackground.main
            : theme.palette.primary.main,
        background:
          activeValue === invoiceType
            ? theme.palette.primary.main
            : theme.palette.inputBackground.main,
        border: '1px solid #E4E9F2',
        borderRadius: '3px',
        margin: '0.6em 0em',
        padding: '1.5em 0.4em',
        cursor: 'pointer',
        transition: 'background 0.2s, border 0.3s',
        '&:hover': {
          background: theme.palette.primary.main,
          color:
            activeValue === invoiceType
              ? theme.palette.inputBackground.main
              : theme.palette.primary.main,
          border: '1px solid #000034',
          h6: {
            color: theme.palette.inputBackground.main,
          },
          p: {
            color: theme.palette.inputBackground.main,
          },
        },
        '&:focus-visible': {
          border: '1px solid #000034',
          outline: 'none',
        },
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}>
      <FormControlLabel
        value={invoiceType}
        control={
          <>
            {icon}
            <Box>
              <Typography variant="h6">{t(label)}</Typography>
              <Typography variant="body2" sx={{py: '0.4em'}}>
                {t(description)}
              </Typography>
            </Box>
          </>
        }
        label=""
        checked={activeValue === invoiceType}
      />
    </Grid>
  );
};

export default InvoiceOption;
