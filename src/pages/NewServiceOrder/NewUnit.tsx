import Typography from '@mui/material/Typography';
import {FlexContainer} from 'components/FlexContainer';
import {PageCard} from 'components/PageCard';
import Grid from '@mui/material/Grid';
// import TextField from '@mui/material/TextField';
import {FormInput} from 'components/form/FormInput';

export const NewUnit = () => (
  <FlexContainer
    containerStyle={{justifyContent: 'center', alignItems: 'center'}}>
    <PageCard
      customHeader={
        <Typography variant="h5" component="div">
          New unit
        </Typography>
      }
      containerStyles={{
        width: '70%',
        height: '90%',
        // flexGrow: 1,
      }}>
      <Grid container>
        <Grid item xs={6}>
          <FormInput
            props={{
              size: 'small',
              //  placeholder: 'Enter Customer Name',
              label: 'customer',
            }}
          />
        </Grid>
      </Grid>
    </PageCard>
  </FlexContainer>
);
