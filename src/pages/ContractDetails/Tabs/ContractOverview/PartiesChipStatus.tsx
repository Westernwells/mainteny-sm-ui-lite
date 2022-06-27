import React, {FC} from 'react';
import {Chip} from '@mui/material';

interface Props {
  partyType: string;
  color: string;
}

const statusColor: Record<string, {[key: string]: string}> = {
  primary: {
    color: '#0B79D0',
    bg: 'rgba(33, 150, 243, 0.08)',
  },
  warning: {
    color: '#C77700',
    bg: 'rgba(237, 108, 2, 0.08)',
  },
};

const PartiesChipStatus: FC<Props> = ({color, partyType}) => (
  <Chip
    label={partyType}
    sx={{
      backgroundColor: statusColor[color].bg,
      color: statusColor[color].color,
    }}
    variant="filled"
  />
);

export default PartiesChipStatus;
