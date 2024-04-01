import Grid from '@mui/material/Grid';
import {ServiceCompanyItem} from 'models/service-company';
import Job from './Job';
import Invoice from './Invoice';

type Props = {
  company: ServiceCompanyItem;
};

const Automations = ({company}: Props) => (
  <Grid container width="100%" height="100%" direction="column" gap="1.3em">
    <Job
      company={company}
      containerStyles={{
        width: '100%',
        padding: '0 24px',
      }}
    />
    <Invoice
      company={company}
      containerStyles={{
        width: '100%',
        padding: '0 24px',
      }}
    />
  </Grid>
);

export default Automations;
