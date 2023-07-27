import {Typography} from '@mui/material';
import React from 'react';

type Props = {};

const LastSyncedItem = (props: Props) => (
  <Typography sx={{alignSelf: 'flex-end', py: '0.5em'}}>
    Synced with XERO
  </Typography>
);

export default LastSyncedItem;
