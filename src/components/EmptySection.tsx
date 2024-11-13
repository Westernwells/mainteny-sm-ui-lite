import Typography, {TypographyProps} from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import Box, {BoxProps} from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import {ReactComponent as LaptopIllustration} from 'assets/illustrations/Laptop.svg';
import {ReactComponent as ClipboardIllustration} from 'assets/illustrations/Clipboard.svg';
import {ReactComponent as AttachmentIllustration} from 'assets/illustrations/Attachment.svg';
import {ReactComponent as QRCodeIllustration} from 'assets/illustrations/QR.svg';
import {ReactComponent as StockIllustration} from 'assets/illustrations/Stock.svg';
import {ReactComponent as SupplierIllustration} from 'assets/illustrations/Supplier.svg';
import {ReactComponent as MobileUsabilityTesting} from 'assets/illustrations/MobileUsabilityTesting.svg';
import {ReactComponent as UXAnalytics} from 'assets/illustrations/UXAnalytics.svg';
import {ReactComponent as BankAccountsIllustration} from 'assets/illustrations/BankAccounts.svg';
import {ReactComponent as PercentageIllustration} from 'assets/illustrations/Percentage.svg';
import {ReactComponent as AttachmentLargeIcon} from 'assets/icons/AttachmentLargeIcon.svg';
import {ReactComponent as LiftIcon} from 'assets/icons/LiftIcon.svg';
import {ReactComponent as HeadphonesHumanIcon} from 'assets/icons/HeadphonesHumanIcon.svg';
import {ReactComponent as CalendarClockGrey} from 'assets/icons/CalendarClockGrey.svg';
import {ReactComponent as CalendarClock} from 'assets/icons/CalendarClock.svg';
import {ReactComponent as ShipmentIcon} from 'assets/icons/ShipmentIcon.svg';
import {ReactComponent as JobsIcon} from 'assets/icons/Jobs.svg';
import {ReactComponent as MultiplePeople} from 'assets/icons/MultiplePeople.svg';
import {ReactComponent as InvoiceIcon} from 'assets/icons/Invoice.svg';
import {Button} from './Button';

export interface Props extends BoxProps {
  label: string;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  btnSize?: 'small' | 'medium' | 'large';
  containerStyle?: {[key: string]: string | number};
  labelStyle?: {[key: string]: string | number};
  labelVariant?: TypographyProps['variant'];
  illustration?:
    | 'attachment'
    | 'clipboard'
    | 'laptop'
    | 'qrcode'
    | 'stock'
    | 'supplier'
    | 'checklist'
    | 'articles'
    | 'emptyChecklistComponents'
    | 'file-attachment'
    | 'lift'
    | 'bankAccounts'
    | 'percentage'
    | 'calendarClock'
    | 'calendarClockGrey'
    | 'contacts'
    | 'jobs'
    | 'employee'
    | 'purchase-invoice'
    | 'invoice';
  showActionBtn?: boolean;
  btnLabel?: string;
  btnAction?: () => void;
  actionButtonIcon?: JSX.Element;
  actionButtonEndIcon?: JSX.Element;
  subLabel?: string;
  subLabelProps?: TypographyProps;
  illustrationColor?: string;
  disableActionBtn?: boolean;
}

export const EmptySection = ({
  label,
  size = 'medium',
  btnSize,
  containerStyle,
  labelStyle,
  labelVariant,
  illustration = 'laptop',
  btnLabel = '',
  showActionBtn = false,
  btnAction,
  actionButtonIcon,
  actionButtonEndIcon,
  subLabel = '',
  subLabelProps = {},
  disableActionBtn = false,
  illustrationColor,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const Width = {
    tiny: '56px',
    small: '128px',
    medium: '192px',
    large: '256px',
  };
  const getIllustration = (variant: string) => {
    switch (variant) {
      case 'attachment':
        return (
          <AttachmentIllustration style={{width: '100%', height: '100%'}} />
        );
      case 'file-attachment':
        return <AttachmentLargeIcon style={{width: '100%', height: '100%'}} />;
      case 'clipboard':
        return (
          <ClipboardIllustration style={{width: '100%', height: '100%'}} />
        );
      case 'qrcode':
        return <QRCodeIllustration style={{width: '100%', height: '100%'}} />;
      case 'stock':
        return <StockIllustration style={{width: '100%', height: '100%'}} />;
      case 'supplier':
        return <SupplierIllustration style={{width: '100%', height: '100%'}} />;
      case 'checklist':
        return (
          <MobileUsabilityTesting style={{width: '100%', height: '100%'}} />
        );
      case 'emptyChecklistComponents':
        return <UXAnalytics style={{width: '100%', height: '100%'}} />;
      case 'articles':
        return <ShipmentIcon style={{width: '100%', height: '100%'}} />;
      case 'lift':
        return <LiftIcon style={{width: '100%', height: '100%'}} />;
      case 'contacts':
        return <HeadphonesHumanIcon style={{width: '100%', height: '100%'}} />;
      case 'bankAccounts':
        return (
          <BankAccountsIllustration style={{width: '100%', height: '100%'}} />
        );
      case 'percentage':
        return (
          <PercentageIllustration
            style={{
              width: '100%',
              height: '100%',
              fill: 'none',
              color: theme.palette.text.secondary,
            }}
          />
        );
      case 'calendarClockGrey':
        return <CalendarClockGrey style={{width: '100%', height: '100%'}} />;
      case 'calendarClock':
        return <CalendarClock style={{width: '100%', height: '100%'}} />;
      case 'jobs':
        return (
          <JobsIcon
            style={{width: '100%', height: '100%', color: illustrationColor}}
          />
        );
      case 'employee':
        return (
          <MultiplePeople
            style={{width: '100%', height: '100%', color: illustrationColor}}
          />
        );
      case 'invoice':
        return (
          <InvoiceIcon
            style={{width: '100%', height: '100%', color: illustrationColor}}
          />
        );
      default:
        return <LaptopIllustration style={{width: '100%', height: '100%'}} />;
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="1em"
      mt={3}
      sx={{...containerStyle}}>
      <Box width={Width[size]} sx={{textAlign: 'center'}}>
        {getIllustration(illustration)}
      </Box>
      <Box display="flex" flexDirection="column">
        <Typography
          variant={labelVariant || 'subtitle2'}
          textAlign="center"
          sx={{...labelStyle}}>
          {t(label)}
        </Typography>
        {subLabel && (
          <Typography variant="body2" textAlign="center" {...subLabelProps}>
            {t(subLabel)}
          </Typography>
        )}
      </Box>
      {showActionBtn ? (
        <Button
          label="Create Service Job"
          buttonProps={{
            disabled: disableActionBtn,
            onClick: btnAction,
            variant: 'contained',
            size: btnSize || 'small',
            startIcon: actionButtonIcon || <AddIcon />,
            endIcon: actionButtonEndIcon || null,
            style: {
              backgroundColor: theme.palette.primary.dark,
            },
            sx: {
              '& .MuiButton-startIcon': {
                marginBottom: '6px',
              },
            },
          }}>
          {t(btnLabel)}
        </Button>
      ) : null}
    </Box>
  );
};
