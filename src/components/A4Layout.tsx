import {ReactNode} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {SxProps, Theme} from '@mui/system';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {convertToText} from 'utils/utils';
import {StatusChip} from './StatusChip';

interface Props {
  children: ReactNode;
  placeholder?: string;
  number?: string;
  containerStyle?: {[key: string]: any};
  status?: string;
}

interface LabelProps {
  text: string;
  required?: boolean;
  sx?: SxProps<Theme>;
}

export const Label = ({text, required, sx}: LabelProps) => (
  <Typography variant="caption" color="grey.700" sx={sx}>
    {text}
    {required && (
      <Typography component="span" variant="caption" color="error.light">
        &nbsp;*
      </Typography>
    )}
  </Typography>
);

/* The width is set to 1240 px because the A4 sheet is (1240 x 1754) at 150 ppi */
/* https://www.papersizes.org/a-sizes-in-pixels.htm  */

export const A4Layout = ({
  children,
  placeholder = '',
  number,
  status,
  containerStyle,
}: Props) => {
  const {user} = useUserSession();
  return (
    <Box width="min(calc(1240px + 1.25em), 100%)" mx="auto" mb="8em" mt="1.5em">
      {status && (
        <Box m=".75em" display="flex" justifyContent="end">
          <StatusChip label={convertToText(status)} />
        </Box>
      )}
      <Box
        p="1em"
        bgcolor="grey.300"
        border="2px solid"
        borderColor="text.disabled"
        borderRadius=".5em"
        sx={{...containerStyle}}>
        <Box bgcolor="white" p="1em">
          <Box display="flex" justifyContent="space-between" mt="1em">
            <Box>
              <Typography variant="subtitle1">
                {user?.userAccount.serviceCompany.name || ''}
              </Typography>
              <Typography component="span" variant="caption">
                {user &&
                  'businessAddress' in user.userAccount.serviceCompany &&
                  user.userAccount.serviceCompany.postalAddress?.fullName}
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
    </Box>
  );
};
