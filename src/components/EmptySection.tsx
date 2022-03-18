import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {ReactComponent as EmptyIllustration} from 'assets/illustrations/EmptyState.svg';

interface Props {
  label: string;
}

export const EmptySection = ({label}: Props) => (
  <Box display="flex" flexDirection="column" alignItems="center" width="50%">
    <EmptyIllustration width="100%" style={{paddingRight: '4%'}} />
    <Typography variant="subtitle2" textAlign="center">
      {label}
    </Typography>
  </Box>
);
