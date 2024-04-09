import {SxProps, Theme} from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

interface SummaryItemProps {
  value: string;
  containerStyle?: SxProps<Theme>;
}

interface SummaryProps {
  label: string;
  icon: JSX.Element;
  children: ReactNode;
}

export const SummaryItem = ({value, containerStyle}: SummaryItemProps) => (
  <Typography
    key={value}
    variant="body2"
    color="primary.dark"
    sx={{mt: '0.2em', ...containerStyle}}>
    {value}
  </Typography>
);

export const Summary = ({label, icon, children}: SummaryProps) => {
  const {t} = useTranslation();
  return (
    <Box sx={{display: 'flex', gap: 1.5, flex: 1, alignItems: 'flex-start'}}>
      {icon}
      <Box>
        <Typography variant="subtitle2" color="primary.dark">
          {t(label)}
        </Typography>
        {children}
      </Box>
    </Box>
  );
};
