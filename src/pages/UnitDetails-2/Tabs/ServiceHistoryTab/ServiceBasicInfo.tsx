import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props {
  icon: JSX.Element;
  label: string;
  bodyTextVariant: any;
  iconBackground?: string;
  bodyText: string;
}

export const MaintenanceBasicInfo = ({
  label,
  bodyTextVariant,
  icon,
  iconBackground,
  bodyText,
}: Props) => (
  <Box display="flex" width="100%">
    <Box
      sx={{
        background: iconBackground,
        p: '0.7em',
        display: 'flex',
        justifyContent: 'center',
        mr: '1em',
      }}>
      {icon}
    </Box>
    <Box>
      <Box>
        <Typography
          variant="caption"
          sx={{color: (theme) => theme.palette.text.secondary}}>
          {label}
        </Typography>
      </Box>
      <Box>
        <Typography variant={bodyTextVariant}>{bodyText}</Typography>
      </Box>
    </Box>
  </Box>
);
