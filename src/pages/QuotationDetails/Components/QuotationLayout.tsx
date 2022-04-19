import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import {MouseEvent, ReactNode} from 'react';

interface Props {
  children: ReactNode;
}

const AlertBox = ({placeholder}: {placeholder: string}) => {
  const email = 'support@mainteny.com';
  return (
    <Alert severity="info">
      <AlertTitle>Note</AlertTitle>
      {placeholder} can be edited in the configured template for your service
      company. Please reach out to &nbsp;
      <Typography
        component="a"
        color="info.main"
        sx={{cursor: 'pointer'}}
        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
          e.stopPropagation();
          window.open(`mailto:${email}`, '_blank');
        }}>
        {email}
      </Typography>
      &nbsp;if you want to modify it.
    </Alert>
  );
};

/* The width is set to 1240 px because the A4 sheet is (1240 x 1754) at 150 ppi */
/* https://www.papersizes.org/a-sizes-in-pixels.htm  */

export const QuotationLayout = ({children}: Props) => (
  <Box
    width="min(calc(1240px + 1.5em), 100%)"
    mx="auto"
    mb="8em"
    p="1.5em"
    bgcolor="grey.300"
    border="2px solid"
    borderColor="text.disabled"
    borderRadius=".5em"
    mt="2.5em">
    <Box bgcolor="white" p=".75em">
      <AlertBox placeholder="Header" />
      {children}
      <Typography
        variant="subtitle2"
        color="info.main"
        my="2em"
        textAlign="center"
        sx={{cursor: 'pointer'}}>
        Terms & Conditions
      </Typography>
      <AlertBox placeholder="Footer" />
    </Box>
  </Box>
);
