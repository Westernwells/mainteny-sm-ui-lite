import {
  Avatar as AvatarMui,
  Box,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {UserAccount, UserAccountView} from 'models/user';
import {getUserFullName} from 'utils/utils';
import {useMemo} from 'react';
import {getInitials} from 'utils/account-utils';
import useTheme from '@mui/material/styles/useTheme';

interface Props {
  userAccount: UserAccountView | UserAccount;
  sx?: SxProps<Theme>;
  removeNameText?: boolean;
}

export const Avatar = ({
  userAccount,
  sx = {},
  removeNameText = false,
}: Props) => {
  const theme = useTheme();
  const filePath = userAccount?.photoUrl;

  const {data} = useDownloadUrl(filePath ? [filePath] : []);
  const url = data?.[filePath];

  const userName = useMemo(() => getUserFullName(userAccount), [userAccount]);

  const avatarProps = useMemo(() => {
    if (url)
      return {
        src: url,
      };
    return {
      children: (
        <Typography
          sx={{
            color: '#828DA3',
            textAlign: 'center',
            fontSize: '10px',
            lineHeight: '10px',
            letterSpacing: '0.1px',
          }}>
          {getInitials(userAccount)}
        </Typography>
      ),
    };
  }, [userAccount]);

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <AvatarMui
        alt={userName}
        sx={{
          width: 25,
          height: 25,
          background: theme.state.hover,
          ...sx,
        }}
        {...avatarProps}
      />
      {!removeNameText && <Typography variant="body2">{userName}</Typography>}
    </Box>
  );
};
