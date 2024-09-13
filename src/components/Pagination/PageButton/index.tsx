import {Button, ButtonProps} from '@mui/material';
import {PropsWithChildren} from 'react';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/system';

type Props = ButtonProps & {
  isSelected?: boolean;
};

const PageButton = ({
  children,
  isSelected = false,
  ...rest
}: PropsWithChildren<Props>) => {
  const theme = useTheme();
  return (
    <Button
      sx={{
        display: 'flex',
        width: '32px',
        height: '32px',
        padding: '0px',
        minHeight: '32px',
        minWidth: '32px',
        border: `1px solid ${theme.palette.grey[500]}`,
        borderRadius: '4px',

        ...(isSelected && {
          color: 'white',
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
        }),
      }}
      disableRipple
      variant="outlined"
      {...rest}>
      <Typography
        sx={{
          display: 'flex',
          color: theme.palette.grey[500],
          ...(isSelected && {
            color: 'white',
            backgroundColor: 'black',
          }),
        }}>
        {children}
      </Typography>
    </Button>
  );
};

export default PageButton;
