import React from 'react';
import {useNavigate} from 'react-router-dom';
import Elevator from '@mui/icons-material/Elevator';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import {StatusChip} from 'components/StatusChip';
import {convertToText} from 'utils/utils';
import {ElevatorStatus, ElevatorView} from '../../models/elevator';

export interface UnitsSectionProperty {
  elevators: ElevatorView[];
  address: string;
}

export const UnitSection = ({elevators, address}: UnitsSectionProperty) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        border: '1px solid #E4E9F2',
        paddingTop: 0.5,
        paddingBottom: 0.5,
        marginTop: 1,
        borderRadius: '4px 4px 0px 0px',
      }}>
      <Box pl={3}>
        <Typography variant="largeBtnText" mt={1} color="textSecondary">
          {address}
        </Typography>
      </Box>

      {elevators.map((elevator) => (
        <Grid
          key={elevator.id}
          container
          sx={{
            paddingTop: 0.5,
            paddingBottom: 0.5,
            paddingLeft: 3,
            '&:hover': {background: 'rgba(0, 209, 255, 0.08)'},
            minHeight: '3rem',
            alignItems: 'center',
          }}>
          <Grid
            item
            xs={3}
            sx={{cursor: 'pointer'}}
            onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
              e.preventDefault();
              navigate(`details/${elevator.id}`);
            }}>
            <Box display="flex" alignItems="center">
              <Elevator style={{marginRight: '10px'}} />
              <Typography variant="body2">{elevator.model}</Typography>
            </Box>
          </Grid>
          <Grid
            item
            container
            xs={9}
            spacing={2}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
            <Grid item xs={3}>
              <Typography variant="body2">
                {elevator.lastVisitDate || 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={3}>
              <Typography variant="body2">
                {' '}
                {elevator.nextVisitDate || ''}
              </Typography>
            </Grid>

            <Grid item xs={3}>
              <Box display="flex" justifyContent="center">
                <StatusChip
                  label={convertToText(elevator.status)}
                  color={
                    elevator.status === ElevatorStatus.RUNNING
                      ? 'success'
                      : 'error'
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};
