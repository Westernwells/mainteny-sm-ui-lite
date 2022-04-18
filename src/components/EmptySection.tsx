import Typography from '@mui/material/Typography';
import Box, {BoxProps} from '@mui/material/Box';
import {ReactComponent as LaptopIllustration} from 'assets/illustrations/Laptop.svg';
import {ReactComponent as ClipboardIllustration} from 'assets/illustrations/Clipboard.svg';
import Button from '@mui/material/Button';

interface Props extends BoxProps {
  label: string;
  size?: 'small' | 'medium' | 'large';
  containerStyle?: {[key: string]: string | number};
  labelStyle?: {[key: string]: string | number};
  labelVariant?: any;
  illustration?: string;
  showActionBtn?: boolean;
  btnLabel?: string;
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
}: Props) => {
  const Width = {
    small: '128px',
    medium: '192px',
    large: '256px',
  };
  const getIllustration = (variant: string) => {
    switch (variant) {
      case 'clipboard':
        return (
          <ClipboardIllustration style={{width: '100%', height: '100%'}} />
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
      <Box width={Width[size]}>{getIllustration(illustration)}</Box>
      <Typography
        variant={labelVariant || 'subtitle2'}
        textAlign="center"
        sx={{...labelStyle}}>
        {label}
      </Typography>
      {showActionBtn ? (
        <Button sx={{textTransform: 'capitalize'}} variant="contained">
          {btnLabel}
        </Button>
      ) : null}
    </Box>
  );
};
