import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

interface SummaryItemProps {
  value: string;
  containerStyle?: {[key: string]: any};
}

interface SummaryProps {
  label: string;
  children: ReactNode;
  containerStyle?: {[key: string]: any};
}

export const SummaryItem = ({value, containerStyle}: SummaryItemProps) => (
  <Typography
    key={value}
    variant="body2"
    color="grey.700"
    sx={{mt: '0.2em', ...containerStyle}}>
    {value}
  </Typography>
);

export const Summary = ({label, children, containerStyle}: SummaryProps) => {
  const {t} = useTranslation();
  return (
    <Box sx={{...containerStyle}}>
      <Typography variant="subtitle2" color="grey.700">
        {t(label)}
      </Typography>
      {children}
    </Box>
  );
};
