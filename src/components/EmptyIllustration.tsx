import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {ReactComponent as LaptopIcon} from 'assets/icons/Laptop.svg';
import useTheme from '@mui/material/styles/useTheme';

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
}: Props) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 3,
        ...containerStyle,
      }}>
      {icon || <LaptopIcon />}
      <Typography
        variant={labelVariant || 'subtitle2'}
        sx={{color: theme.palette.text.secondary, ...labelStyle}}>
        {label}
      </Typography>
    </Box>
  );
};
