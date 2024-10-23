import Grid from '@mui/material/Grid';
import {ServiceCompanyItem} from 'models/service-company';
import Job from './Job';
import Invoice from './Invoice';

type Props = {
  company: ServiceCompanyItem;
};

const Automations = ({company}: Props) => (
  <Grid container direction="column" gap="1.3em">
    <Job
      company={company}
      containerStyles={{
        width: '100%',
        padding: '12px 24px 24px 24px',
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
