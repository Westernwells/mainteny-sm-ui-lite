import {ReactNode} from 'react';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';

interface Props {
  children: ReactNode;
}

export const RelatedTo = ({children}: Props) => <Box>{children}</Box>;
