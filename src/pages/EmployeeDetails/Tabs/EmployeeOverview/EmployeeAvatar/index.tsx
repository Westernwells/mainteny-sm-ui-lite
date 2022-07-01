import {Avatar, Box, Typography} from '@mui/material';
import {styled} from '@mui/material/styles';
import Badge from '@mui/material/Badge';

import {capitalize} from 'utils/utils';

type EmployeeAvatarProps = {
  name?: string;
  subTitle?: string | string[];
  isOnline?: Boolean;
};
const EmployeeAvatar = ({name, subTitle, isOnline}: EmployeeAvatarProps) => {
  const StyledBadge = styled(Badge)(({theme}) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#00D68F',
      color: '#00D68F',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      display: `${!isOnline && 'none'}`,
    },
  }));

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Box sx={{position: 'relative'}}>
        <>
          <StyledBadge
            overlap="circular"
            anchorOrigin={{vertical: 'top', horizontal: 'right'}}
            variant="dot">
            <Avatar
              alt=""
              src=""
              variant="circular"
              sx={{
                width: '80px',
                height: '80px',
                aspectRatio: '1',
              }}
            />
          </StyledBadge>
          {/* TODO: return for edit avatar image */}
          {/* <IconButton
            sx={{
              position: 'absolute',
              background: '#00A0CC',
              color: 'white',
              bottom: '0',
              right: '0',
              border: '1px solid white',
              width: '24px',
              height: '24px',
              '&:hover': {
                background: '#08baeb',
              },
            }}>
            <Edit sx={{fontSize: '14px'}} />
          </IconButton> */}
        </>
      </Box>
      <Box>
        {name && (
          <Typography variant="subtitle1" textAlign="center">
            {name}
          </Typography>
        )}

        {subTitle && (
          <Typography
            variant="subtitle2"
            color="textSecondary"
            textAlign="center">
            {subTitle
              ? Array.isArray(subTitle)
                ? `${capitalize(subTitle as string[])}`
                : subTitle
              : '-'}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeAvatar;
