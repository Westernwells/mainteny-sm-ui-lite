import Box, {BoxProps} from '@mui/material/Box';

import {CSSProperties} from 'react';
import {ReactComponent as MaintenyPin} from '../assets/icons/MaintenyPin.svg';

interface Props extends BoxProps {
  lat: number;
  lng: number;
  style?: CSSProperties;
}

export const MarkerPin = ({
  style,
  lat, // eslint-disable-line
  lng /* eslint-disable-line */, //we had to disable this rule, we do not need this props but react google maps require us to pass it
}: Props) => (
    <Box style={style} width="3rem" height="3rem">
      <MaintenyPin style={{width: '100%', height: '100%'}} />
    </Box>
  );
