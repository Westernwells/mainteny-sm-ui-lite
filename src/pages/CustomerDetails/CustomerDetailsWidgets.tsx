import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';

import Typography from '@mui/material/Typography';
import {InputLabel} from '@mui/material';
import {grey} from '@mui/material/colors';
import {Widget} from 'components/Widget';

interface Props {
  containerStyle?: {[key: string]: string | number};
}

export const CustomerDetailsWidgets = ({containerStyle}: Props) => {
  const theme = useTheme();
  return (
    <Box display="flex" justifyContent="space-between" sx={{...containerStyle}}>
      <Box display="flex" mt="2em" sx={{width: '50%'}}>
        <Box
          sx={{
            background: theme.palette.primary.main,
            py: '0.5em',
            px: '0.5em',
            color: '#fff',
            width: '30%',
          }}>
          <Typography sx={{textAlign: 'center'}}>Contracts (13)</Typography>
        </Box>

        <Box
          sx={{
            background: '#fff',
            py: '0.5em',
            px: '0.5em',
            color: '#000',
            width: '30%',
          }}>
          <Typography
            sx={{textAlign: 'center', color: grey[900]}}
            component={InputLabel}>
            Units (50)
          </Typography>
        </Box>
      </Box>
      <Box mt={3}>
        <Widget
          hideViewOption
          searchPlaceholder="Try 'Astralift BV'"
          onSearchTextChanged={() => {}}
          setShowFilter={() => {}}
          showFilter={false}
        />
      </Box>
    </Box>
  );
};
