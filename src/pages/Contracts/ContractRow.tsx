import Grid from '@mui/material/Grid';

import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import useTheme from '@mui/material/styles/useTheme';
import * as _ from 'lodash';
import {useNavigate} from 'react-router-dom';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import {formatDate} from '../../utils/datetime';
import {ElevatorView} from '../../models/elevator';
import {ContractView} from '../../models/contract';

interface ContractRecord {
  contract: ContractView;
  elevators: ElevatorView[];
}

export interface Props {
  contract: ContractView;
}

export const ContractRow = ({contract}: Props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Box
      onClick={() => navigate(contract.id)}
      sx={{
        backgroundColor: '#fff',
        border: '1px solid #E4E9F2',
        paddingTop: 1,
        paddingBottom: 1,
        marginTop: '8px',
        borderRadius: '4px',
        minHeight: '3rem',
      }}
    >
      <Grid container sx={{pl: 2}}>
        <Grid item xs={3} sx={{cursor: 'pointer'}}>
          <Typography variant="subtitle1">
            {contract.serviceCompany.name}
          </Typography>
        </Grid>

        <Grid item xs={2}>
          <Typography variant="largeBtnText">{contract.number}</Typography>
        </Grid>

        <Grid item xs={1}>
          <Box display="flex" justifyContent="center">
            <Typography variant="largeBtnText">
              {contract.units ? contract.units : 0}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={2}>
          <Box display="flex" justifyContent="center">
            <Typography variant="largeBtnText">
              {contract.price.toLocaleString('en-US', {
                style: 'currency',
                currency: contract.currency,
              })}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={2}>
          <Box display="flex" justifyContent="center">
            <Typography variant="largeBtnText">
              {formatDate(contract.endTime)}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={2}>
          <Box display="flex" justifyContent="center">
            <FileDownloadOutlinedIcon sx={{color: theme.palette.info.main}} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
