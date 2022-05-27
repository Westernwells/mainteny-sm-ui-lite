import Typography from '@mui/material/Typography';
import Box, {BoxProps} from '@mui/material/Box';
import {ReactComponent as LaptopIllustration} from 'assets/illustrations/Laptop.svg';
import {ReactComponent as ClipboardIllustration} from 'assets/illustrations/Clipboard.svg';
import {Button} from './Button';

interface Props extends BoxProps {
  label: string;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  containerStyle?: {[key: string]: string | number};
  labelStyle?: {[key: string]: string | number};
  labelVariant?: any;
  illustration?: 'clipboard' | 'laptop';
  showActionBtn?: boolean;
  btnLabel?: string;
  btnAction?: () => void;
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
}: Props) => {
  const Width = {
    tiny: '56px',
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
        <Button
          label="Create Service Order"
          buttonProps={{
            onClick: btnAction,
            variant: 'contained',
            size: 'medium',
          }}>
          {btnLabel}
        </Button>
      ) : null}
    </Box>
  );
};
