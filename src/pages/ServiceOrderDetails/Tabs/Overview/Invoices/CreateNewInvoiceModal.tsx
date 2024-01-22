import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {theme} from 'theme';
import {
  Grid,
  FormControlLabel,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  RadioGroup,
  DialogActions,
} from '@mui/material';
import {InvoiceType} from 'models/invoice';
import {Button} from 'components/Button';
import {ReactComponent as FinalInvoiceIcon} from 'assets/icons/FinalInvoiceIcon.svg';
import {ReactComponent as UpfrontInvoiceIcon} from 'assets/icons/UpfrontInvoiceIcon.svg';
import {ReactComponent as PartialInvoiceIcon} from 'assets/icons/PartialInvoiceIcon.svg';

interface Props {
  open: boolean;
  onClose: () => void;
  orderId: string;
  invoiceTypesToShow?: InvoiceType[];
}

const iconStyle = {
  fontSize: '3.5rem',
  flex: '0 0 20%',
};

const invoiceTypeOptions = [
  {
    label: 'Full Invoice',
    description:
      'Straight-forward transaction requiring full payment upon delivery of goods or completion of services.',
    icon: <FinalInvoiceIcon style={iconStyle} />,
    invoiceType: InvoiceType.FULL,
  },
  {
    label: 'Final Invoice',
    description:
      'Consolidates all previous partial or upfront payments for a job, addressing any remaining balance and marking the financial conclusion of the work.',
    icon: <FinalInvoiceIcon style={iconStyle} />,
    invoiceType: InvoiceType.FINAL,
  },
  {
    label: 'Partial Invoice',
    description:
      'For transactions where the payment will be made in multiple installments over a period of time.',
    icon: <PartialInvoiceIcon style={iconStyle} />,
    invoiceType: InvoiceType.PARTIAL,
  },
  {
    label: 'Upfront Invoice',
    description:
      'Use when full payment is required before the delivery of goods or services.',
    icon: <UpfrontInvoiceIcon style={iconStyle} />,
    invoiceType: InvoiceType.UPFRONT,
  },
];

const CreateNewInvoiceModal = ({
  open,
  onClose,
  orderId,
  invoiceTypesToShow,
}: Props) => {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const [selectedValue, setSelectedValue] = useState<InvoiceType | null>(null);

  const handleClick = (invoiceType: InvoiceType) => {
    setSelectedValue(invoiceType);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          p: '1.5rem',
        },
      }}>
      <DialogTitle id="alert-dialog-title" sx={{px: 0, pt: 0}}>
        {t('Create new invoice')}
      </DialogTitle>
      <DialogContent sx={{p: 0, pb: '0.5rem'}}>
        <RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={selectedValue}>
          {invoiceTypeOptions
            .filter((item) =>
              !invoiceTypesToShow?.length
                ? true
                : invoiceTypesToShow?.includes(item.invoiceType),
            )
            .map((item, index) => (
              <Grid
                tabIndex={0}
                key={`{${item}-${index}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color:
                    selectedValue === item.invoiceType
                      ? theme.palette.inputBackground.main
                      : theme.palette.primary.main,
                  background:
                    selectedValue === item.invoiceType
                      ? theme.palette.primary.main
                      : theme.palette.inputBackground.main,
                  border: '1px solid #E4E9F2',
                  borderRadius: 1,
                  my: 1,
                  p: 2.5,
                  cursor: 'pointer',
                  transition: 'background 0.2s, border 0.3s',
                  svg: {
                    color:
                      selectedValue === item.invoiceType
                        ? theme.palette.secondary.main
                        : theme.palette.primary.light,
                  },
                  '&:hover': {
                    svg: {
                      color: theme.palette.secondary.main,
                    },
                    background: theme.palette.primary.main,
                    color:
                      selectedValue === item.invoiceType
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
                onClick={() => handleClick(item.invoiceType)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleClick(item.invoiceType);
                  }
                }}>
                <FormControlLabel
                  value={item.invoiceType}
                  control={
                    <>
                      {item.icon}
                      <Box>
                        <Typography variant="h6">{t(item.label)}</Typography>
                        <Typography variant="body2" sx={{py: '0.4rem'}}>
                          {t(item.description)}
                        </Typography>
                      </Box>
                    </>
                  }
                  label=""
                  checked={selectedValue === item.invoiceType}
                />
              </Grid>
            ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button
          buttonProps={{
            size: 'medium',
            variant: 'text',
            onClick: onClose,
            sx: {
              textTransform: 'capitalize',
            },
          }}>
          <Typography variant="subtitle2">{t('Cancel')}</Typography>
        </Button>
        <Button
          buttonProps={{
            size: 'medium',
            variant: 'contained',
            disabled: !selectedValue,
            onClick: () =>
              navigate(
                `/invoices/new?invoiceType=${selectedValue}&orderId=${orderId}`,
              ),
            sx: {
              textTransform: 'capitalize',
            },
          }}>
          <Typography variant="subtitle2">{t('Create')}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateNewInvoiceModal;
