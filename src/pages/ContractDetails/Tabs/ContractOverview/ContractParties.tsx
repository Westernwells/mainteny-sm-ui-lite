import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import {ServiceCompanyView} from 'models/service-company';
import {PropertyOwnerView} from 'models/propertyManager';
import {StatusChip} from 'components/StatusChip';
import {convertToText} from 'utils/utils';

interface Props {
  personName?: string;
  companyName?: string;
  email?: string;
  partyType?: string;
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
  personName,
  companyName,
  email,
  partyType,
  containerStyle,
  chipColor,
}: Props) => (
  <Grid container sx={{...containerStyle}}>
    <Grid item xs={4}>
      <Box display="flex">
        <Avatar sx={{width: '3rem', height: '3rem', mr: '1em'}}>H</Avatar>

        <Box display="flex" flexDirection="column">
          <Typography variant="subtitle1" sx={{display: 'block'}}>
            {personName || ''}
          </Typography>
        </Box>
      </Box>
    </Grid>

    <Grid item xs={5}>
      <Box display="flex">
        <Box>
          <Box>
            <Typography
              variant="body2"
              sx={{display: 'block'}}
              color="textSecondary">
              {companyName || ''}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary">
              {email || ''}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Grid>

    <Grid item xs={3}>
      <StatusChip
        color={chipColor}
        length="long"
        label={partyType ? convertToText(partyType) : ''}
        style={{px: '1em'}}
      />
    </Grid>
  </Grid>
);
