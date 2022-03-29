import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import {ServiceCompanyView} from 'models/service-company';
import {ClientView} from 'models/client';
import {StatusChip} from 'components/StatusChip';

interface Props {
  personName?: string;
  companyName?: string;
  email?: string;
  partyRole?: string;
  partyType?: string;
  containerStyle?: {[key: string]: string | number};
  chipTextColor?: string;
  chipBgColor?: string;
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
  [key: string]: ServiceCompanyView | ClientView | undefined;
}

export const ContractParties = ({
  personName,
  companyName,
  email,
  partyRole,
  partyType,
  containerStyle,
  chipTextColor,
  chipBgColor,
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
          <Typography
            variant="body2"
            sx={{display: 'block'}}
            color="textSecondary">
            {partyRole || ''}
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
        label={partyType || ''}
        textColor={chipTextColor}
        bgColor={chipBgColor}
        style={{px: '1em'}}
      />
    </Grid>
  </Grid>
);
