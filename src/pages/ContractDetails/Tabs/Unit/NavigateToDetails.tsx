import React from 'react';
import {useNavigate} from 'react-router';
import Typography from '@mui/material/Typography';
import {ElevatorView} from 'models/elevator';

interface Props {
  unit: ElevatorView;
}

export const NavigateToUnit = ({unit}: Props) => {
  const navigate = useNavigate();
  return unit.externalId ? (
    <Typography
      variant="subtitle1"
      onClick={() => navigate(`/units/details/${unit.id}`)}
      sx={{
        color: 'primary.light',
        cursor: 'pointer',
      }}>
      {unit.externalId !== '' ? unit.externalId : 'Unassigned'}
    </Typography>
  ) : (
    <Typography variant="subtitle1">
      {unit.externalId !== '' ? unit.externalId : 'Unassigned'}
    </Typography>
  );
};
