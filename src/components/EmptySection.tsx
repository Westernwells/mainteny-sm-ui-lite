import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {ReactComponent as EmptyIllustration} from 'assets/illustrations/LaptopIcon.svg';

interface Props {
  label: string;
  size?: 'small' | 'medium' | 'large';
  containerStyle?: {[key: string]: string | number};
  labelStyle?: {[key: string]: string | number};
  labelVariant?: any;
}

export const EmptySection = ({
  label,
  size = 'medium',
  containerStyle,
  labelStyle,
  labelVariant,
}: Props) => {
  const Width = {
    small: '128px',
    medium: '192px',
    large: '256px',
  };
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="1em"
      mt={3}
      sx={{...containerStyle}}>
      <Box width={Width[size]}>
        <EmptyIllustration style={{width: '100%', height: '100%'}} />
      </Box>
      <Typography
        variant={labelVariant || 'subtitle2'}
        textAlign="center"
        sx={{...labelStyle}}>
        {label}
      </Typography>
    </Box>
  );
};
