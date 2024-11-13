import {Box} from '@mui/material';
import {ServiceCompanyItem} from 'models/service-company';
import GeneralInfo from './GeneralInfo';
import BankAccounts from './BankAccounts';
import TaxRates from './TaxRates';

type Props = {
  company: ServiceCompanyItem;
};

const Financials = ({company}: Props) => (
  <Box display="flex" flexDirection="column" gap={3}>
    <GeneralInfo company={company} />
    <BankAccounts company={company} />
    <TaxRates />
  </Box>
);

export default Financials;
