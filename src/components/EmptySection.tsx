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
import {Button} from './Button';

interface Props extends BoxProps {
  label: string;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  containerStyle?: {[key: string]: string | number};
  labelStyle?: {[key: string]: string | number};
  labelVariant?: any;
  illustration?:
    | 'attachment'
    | 'clipboard'
    | 'laptop'
    | 'qrcode'
    | 'stock'
    | 'supplier'
    | 'checklist'
    | 'emptyChecklistComponents';
  showActionBtn?: boolean;
  btnLabel?: string;
  btnAction?: () => void;
  actionButtonIcon?: JSX.Element;
  actionButtonEndIcon?: JSX.Element;
  subLabel?: string;
  subLabelProps?: TypographyProps;
}

export const EmptySection = ({
  label,
  size = 'medium',
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
      <Box width={Width[size]}>{getIllustration(illustration)}</Box>
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
      {showActionBtn ? (
        <Button
          label="Create Service Job"
          buttonProps={{
            onClick: btnAction,
            variant: 'contained',
            size: 'large',
            startIcon: actionButtonIcon || <AddIcon />,
            endIcon: actionButtonEndIcon || null,
            style: {
              backgroundColor: theme.palette.primary.mainLight,
            },
          }}>
          {t(btnLabel)}
        </Button>
      ) : null}
    </Box>
  );
};
