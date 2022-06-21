import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import {ServiceCompanyView} from 'models/service-company';
import {PropertyOwnerView} from 'models/propertyManager';
import PartiesChipStatus from './PartiesChipStatus';

interface Props {
  name?: string;
  address?: string;
  phoneNumber?: string;
  partyType?: string;
  occupation?: string;
  containerStyle?: {[key: string]: string | number};
  chipColor?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
}

export interface Parties {
  [key: string]: ServiceCompanyView | PropertyOwnerView | undefined;
}

export const ContractParties = ({
  name,
  occupation,
  address,
  phoneNumber,
  partyType,
  containerStyle,
  chipColor,
}: Props) => (
  <Grid container sx={{...containerStyle, marginBottom: 2}}>
    <Grid item xs={5}>
      <Box display="flex" alignItems="center">
        <Avatar sx={{width: '3rem', height: '3rem', mr: '1em'}}>H</Avatar>

        <Box display="flex" flexDirection="column">
          <Typography variant="subtitle1" sx={{display: 'block'}}>
            {name || ''}
          </Typography>
          <Typography variant="body2" sx={{display: 'block'}}>
            {occupation || ''}
          </Typography>
        </Box>
      </Box>
    </Grid>

    <Grid item xs={5} alignSelf="center">
      <Box>
        <Typography variant="body2" color="textSecondary">
          {address || ''}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {phoneNumber ? `(${phoneNumber})` : ''}
        </Typography>
      </Box>
    </Grid>
    <Grid item xs={2} alignSelf="center">
      <PartiesChipStatus color={chipColor!} partyType={partyType!} />
    </Grid>
  </Grid>
);
