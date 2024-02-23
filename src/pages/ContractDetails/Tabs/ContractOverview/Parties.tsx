import React, {FC} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/material/styles/useTheme';
import {ContractView} from 'models/contract';
import {ReactComponent as BriefcaseGray} from 'assets/icons/briefcase-gray.svg';
import {UserSession} from 'models/session';
import {SectionTitle} from '../../../InvoiceDetails/SectionTitle';
import {ContractCard} from './ContractCard';
import {ContractParties} from './ContractParties';

interface Props {
  contractDetails: ContractView;
  user?: UserSession;
}

export const Parties: FC<Props> = ({contractDetails, user}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <Grid item xs={12} md={8}>
      <ContractCard
        containerStyles={{
          mt: '1em',
          '& .MuiCardHeader-root': {
            pb: 0,
          },
          height: 'calc(100% - 1em)',
        }}
        header={
          <Box>
            <SectionTitle
              Icon={BriefcaseGray}
              title="Parties"
              containerSx={{backgroundColor: 'unset'}}
            />
          </Box>
        }>
        <Grid
          container
          sx={{
            flexBasis: '100%',
            borderBottom: `2px solid ${theme.palette.action.disabledBackground}`,
            mt: '0.5em',
            mb: '1em',
            lineHeight: '38px',
          }}>
          <Grid
            item
            xs={5}
            sx={{color: theme.palette.text.secondary, fontWeight: 600}}>
            {t('CONTRACT PARTY')}
          </Grid>
          <Grid
            item
            xs={5}
            sx={{color: theme.palette.text.secondary, fontWeight: 600}}>
            {t('ADDRESS')}
          </Grid>
          <Grid
            item
            xs={2}
            display="flex"
            justifyContent="center"
            sx={{color: theme.palette.text.secondary, fontWeight: 600}}>
            {t('PARTY TYPE')}
          </Grid>
        </Grid>
        <ContractParties
          name={user?.userAccount.serviceCompany.name}
          occupation="Service Company"
          address={
            user?.userAccount.serviceCompany.postalAddress?.fullName ?? ''
          }
          phoneNumber={user?.userAccount.serviceCompany.contact.phone}
          partyType="CONTRACTOR"
          chipStyles={{
            chipMaxChars: 15,
            chipColor: 'warning',
          }}
        />
        <ContractParties
          name={contractDetails?.propertyOwner.name}
          occupation="Property Owner"
          address={
            contractDetails?.propertyOwner.billingAddress?.fullName ?? ''
          }
          phoneNumber={contractDetails?.propertyOwner.contact.phone}
          partyType="CUSTOMER"
          chipStyles={{
            chipColor: 'primary',
          }}
        />
      </ContractCard>
    </Grid>
  );
};
