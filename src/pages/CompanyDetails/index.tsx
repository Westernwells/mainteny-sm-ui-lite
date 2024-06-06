import {useEffect, useLayoutEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Grid} from '@mui/material';

import {Progress} from 'components/Progress';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {BasicInformation} from './BasicInformation';
import {Settings} from './Settings';
import {LegalInformation} from './LegalInformation';
import {Policies} from './Policies';
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
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <BasicInformation company={company!} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Settings company={company!} />
      </Grid>

      <Grid item xs={12} md={4}>
        <LegalInformation company={company!} />
      </Grid>
      <Grid item xs={12} md={4}>
        <Policies company={company!} />
      </Grid>
      <Grid item xs={12}>
        <UserTable companyId={companyId!} />
      </Grid>
    </Grid>
  );
};

export default CompanyDetails;
