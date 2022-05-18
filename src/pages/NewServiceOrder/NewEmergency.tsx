import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {FlexContainer} from 'components/FlexContainer';
import {SearchInput} from 'components/SearchInput';
import {Stepper} from 'components/Stepper';

const steps = ['Select Unit', 'Select Technicians', 'Add Description'];

export const NewEmergency = () => {
  console.log('>>>>><<<<<<<...??');
  return (
    <Stepper
      steps={steps}
      containerStyles={{
        mt: '3em',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <FlexContainer>
        <Box display="flex" justifyContent="space-between" mt="2em">
          <Typography variant="h6" component="div">
            Choose Unit
          </Typography>
          <SearchInput placeholder="Search" />
        </Box>
      </FlexContainer>
    </Stepper>
  );
};
