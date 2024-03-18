import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import {ServiceCompanyView} from 'models/service-company';
import {PropertyOwnerView} from 'models/propertyManager';
import {useTranslation} from 'react-i18next';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import PartiesChipStatus from './PartiesChipStatus';

interface Props {
  name?: string;
  address?: string;
  phoneNumber?: string;
  partyType?: string;
  occupation?: string;
  containerStyle?: {[key: string]: string | number};
  customerNumber?: string;
  customerId?: string;
  chipStyles?: {
    chipMaxChars?: number;
    chipLength?: 'short' | 'medium' | 'long' | 'auto';
    chipColor?:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'error'
      | 'info'
      | 'success'
      | 'warning';
  };
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
  chipStyles,
  customerNumber,
  customerId,
}: Props) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  return (
    <Grid container sx={{...containerStyle, marginBottom: 2}}>
      <Grid item xs={3}>
        <Box display="flex" alignItems="center">
          <Box display="flex" flexDirection="column">
            {customerNumber ? (
              <Typography
                variant="subtitle1"
                onClick={() =>
                  navigate(`/customers/details/${customerId}?tab=0`)
                }
                sx={{
                  color: 'primary.light',
                  cursor: 'pointer',
                }}>
                {name || ''}
              </Typography>
            ) : (
              <Typography
                variant="subtitle1"
                sx={{display: 'block', fontWeight: '600'}}>
                {name || ''}
              </Typography>
            )}
            <Typography variant="body2" sx={{display: 'block'}}>
              {typeof occupation === 'string' ? t(occupation) : ''}
            </Typography>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={3} alignSelf="center">
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {customerNumber || '-'}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={3} alignSelf="center">
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {address || ''}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {phoneNumber ? `(${phoneNumber})` : ''}
          </Typography>
        </Box>
      </Grid>
      <Grid
        item
        xs={3}
        alignSelf="center"
        display="flex"
        justifyContent="center">
        <PartiesChipStatus
          color={chipStyles?.chipColor! || 'primary'}
          length={chipStyles?.chipLength || 'auto'}
          maxChars={chipStyles?.chipMaxChars || undefined}
          partyType={partyType!}
        />
      </Grid>
    </Grid>
  );
};
