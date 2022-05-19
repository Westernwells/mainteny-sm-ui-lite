import Box from '@mui/material/Box';
import {ReactNode} from 'react';

interface Props {
  children: ReactNode;
}

/* The width is set to 1240 px because the A4 sheet is (1240 x 1754) at 150 ppi */
/* https://www.papersizes.org/a-sizes-in-pixels.htm  */

export const A4Layout = ({children}: Props) => (
  <Box
    width="min(calc(1240px + 1.25em), 100%)"
    mx="auto"
    mb="8em"
    p="1.25em"
    bgcolor="grey.300"
    border="2px solid"
    borderColor="text.disabled"
    borderRadius=".5em"
    mt="2.5em">
    <Box bgcolor="white" p=".75em">
      {children}
    </Box>
  </Box>
);
