import {useEffect, useLayoutEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Grid} from '@mui/material';

import {Progress} from 'components/Progress';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {BasicInformation} from './BasicInformation';
import {Addresses} from './Addresses';
import {Settings} from './Settings';
import {LegalInformation} from './LegalInformation';
import {PaymentInformation} from './PaymentInformation';
import {BillingInformation} from './BillingInformation';
import {Dispatching} from './Dispatching';
import {Policies} from './Policies';
import {WhiteLabel} from './WhiteLabel';
import {UserTable} from './UserTable';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const CompanyDetails = ({getCurrentPageTitle}: Props) => {
  const [companyName, setCompanyName] = useState('');
  const {id: companyId} = useParams();

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle(companyName);
    }
  }, [companyName]);

  const {data: company, isLoading} = useCompanyById(companyId);

  useEffect(() => {
    if (company) {
      setCompanyName(company.name);
    }
  }, [company]);

  if (isLoading) {
    return <Progress />;
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid item md={3} sm={12}>
          <BasicInformation company={company!} />
        </Grid>
        <Grid item md={6} sm={12}>
          <Addresses company={company!} containerStyles={{height: '100%'}} />
        </Grid>
        <Grid item md={3} sm={12}>
          <Settings company={company!} />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{mt: '0.3em'}}>
        <Grid item md={3} sm={12}>
          <LegalInformation company={company!} />
        </Grid>
        <Grid item md={6} sm={12}>
          <PaymentInformation company={company!} />
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
          <Dispatching company={company!} containerStyles={{height: '100%'}} />
        </Grid>
        <Grid item md={6} sm={12}>
          <WhiteLabel company={company!} containerStyles={{height: '100%'}} />
        </Grid>
        <Grid item md={3} sm={12}>
          <Policies company={company!} containerStyles={{height: '100%'}} />
        </Grid>
      </Grid>
      <Grid container spacing={2} sx={{mt: '0.3em'}}>
        <Grid item xs={12}>
          <UserTable companyId={companyId!} />
        </Grid>
      </Grid>
    </>
  );
};
