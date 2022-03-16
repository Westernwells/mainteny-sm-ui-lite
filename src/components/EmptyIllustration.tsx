import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {ReactComponent as EmptyScreenIcon} from 'assets/icons/EmptySection.svg';

interface Props {
  label: string;
  icon?: JSX.Element;
  containerStyle?: {[key: string]: string | number};
  labelStyle?: {[key: string]: string | number};
  labelVariant?: any;
}

export const EmptyIllustration = ({
  label,
  icon,
  containerStyle,
  labelStyle,
  labelVariant,
}: Props) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      mt: 3,
      ...containerStyle,
    }}>
    {icon || <EmptyScreenIcon />}
    <Typography
      variant={labelVariant || 'h5'}
      sx={{mt: '3.8em', ...labelStyle}}>
      {label}
    </Typography>
  </Box>
);
