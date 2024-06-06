import Grid from '@mui/material/Grid';
import {ServiceCompanyItem} from 'models/service-company';
import GeneralInfo from './GeneralInfo';
import BankAccounts from './BankAccounts';

type Props = {
  company: ServiceCompanyItem;
};

const Financials = ({company}: Props) => (
  <Grid container direction="column" gap={3}>
    <GeneralInfo company={company} />
    <BankAccounts company={company} />
  </Grid>
);

export default Financials;
