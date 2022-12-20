import {useLayoutEffect} from 'react';
import {Grid} from '@mui/material';

import {Progress} from 'components/Progress';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {BasicInformation} from 'pages/CompanyDetails/BasicInformation';
import {Addresses} from 'pages/CompanyDetails/Addresses';
import {Settings} from 'pages/CompanyDetails/Settings';
import {LegalInformation} from 'pages/CompanyDetails/LegalInformation';
import {PaymentInformation} from 'pages/CompanyDetails/PaymentInformation';
import {BillingInformation} from 'pages/CompanyDetails/BillingInformation';
import {WhiteLabel} from 'pages/CompanyDetails/WhiteLabel';
import {Policies} from 'pages/CompanyDetails/Policies';
import {DefinedContractNames} from 'pages/CompanyDetails/DefinedContractNames';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const SettingsPage = ({getCurrentPageTitle}: Props) => {
  const {user} = useUserSession();

  const {data: company, isLoading} = useCompanyById(
    user?.userAccount.serviceCompany.id,
  );

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle('Settings');
    }
  }, []);

  if (isLoading) {
    return <Progress />;
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid item md={3} sm={12}>
          <BasicInformation
            company={company!}
            containerStyles={{height: '100%'}}
          />
        </Grid>
        <Grid item md={6} sm={12}>
          <Addresses company={company!} containerStyles={{height: '100%'}} />
        </Grid>
        <Grid item md={3} sm={12}>
          <Settings company={company!} containerStyles={{height: '100%'}} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{mt: '0.3em'}}>
        <Grid item md={3} sm={12}>
          <LegalInformation company={company!} />
        </Grid>
        <Grid item md={6} sm={12}>
          <PaymentInformation
            company={company!}
            containerStyles={{height: '100%'}}
          />
        </Grid>
        <Grid item md={3} sm={12}>
          <BillingInformation
            company={company!}
            containerStyles={{height: '100%'}}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{mt: '0.3em'}}>
        <Grid item md={3} sm={12}>
          <Policies company={company!} containerStyles={{height: '100%'}} />
        </Grid>
        <Grid item md={6} sm={12}>
          <DefinedContractNames
            company={company!}
            containerStyles={{height: '100%'}}
          />
        </Grid>
        <Grid item md={3} sm={12}>
          <WhiteLabel company={company!} containerStyles={{height: '100%'}} />
        </Grid>
      </Grid>
    </>
  );
};
