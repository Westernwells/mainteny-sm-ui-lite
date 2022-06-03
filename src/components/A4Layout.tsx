import {ReactNode} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {useUserSession} from 'hooks/reactQuery/useUserSession';

interface Props {
  children: ReactNode;
  placeholder: string;
  number?: string;
}

/* The width is set to 1240 px because the A4 sheet is (1240 x 1754) at 150 ppi */
/* https://www.papersizes.org/a-sizes-in-pixels.htm  */

export const A4Layout = ({children, placeholder, number}: Props) => {
  const {user} = useUserSession();
  return (
    <Box
      width="min(calc(1240px + 1.25em), 100%)"
      mx="auto"
      mb="8em"
      p="1em"
      bgcolor="grey.300"
      border="2px solid"
      borderColor="text.disabled"
      borderRadius=".5em"
      mt="2.5em">
      <Box bgcolor="white" p="1em">
        <Box display="flex" justifyContent="space-between" mt="1em">
          <Box>
            <Typography variant="subtitle1">
              {user?.userAccount.serviceCompany.name || ''}
            </Typography>
            <Typography component="span" variant="caption">
              {user &&
                'businessAddress' in user.userAccount.serviceCompany &&
                user.userAccount.serviceCompany.businessAddress?.fullName}
            </Typography>
          </Box>
          {number && (
            <Box textAlign="end">
              <Typography component="span" variant="caption">
                {placeholder} Number
              </Typography>
              <Typography variant="subtitle1">{number}</Typography>
            </Box>
          )}
        </Box>
        {children}
      </Box>
    </Box>
  );
};
