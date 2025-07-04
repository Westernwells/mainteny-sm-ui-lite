import {
  Avatar as AvatarMui,
  Box,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {getUserFullName} from 'utils/utils';
import {useMemo} from 'react';
import {getInitials} from 'utils/account-utils';
import useTheme from '@mui/material/styles/useTheme';
import {AvatarView} from 'models/avatar';

interface Props {
  userAccount: AvatarView;
  sx?: SxProps<Theme>;
  containerSx?: SxProps<Theme>;
  labelStyles?: SxProps<Theme>;
  initialsTextStyles?: SxProps<Theme>;
  removeNameText?: boolean;
  /**
   * Show only one initial depending on if first name is present fallback last name
   */
  onlyFirstInitial?: boolean;
  key?: string;
}

export const Avatar = ({
  userAccount,
  sx = {},
  containerSx = {},
  labelStyles = {},
  initialsTextStyles = {},
  removeNameText = false,
  onlyFirstInitial = false,
}: Props) => {
  const theme = useTheme();
  const filePath = userAccount?.photoUrl;

  const {data} = useDownloadUrl(filePath ? [filePath] : []);
  const url = filePath ? data?.[filePath] : undefined;

  const userName = useMemo(() => getUserFullName(userAccount), [userAccount]);

  const initialsToShow = getInitials(userAccount, onlyFirstInitial);

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
            textTransform: 'uppercase',
            ...initialsTextStyles,
          }}>
          {initialsToShow && initialsToShow}
        </Typography>
      ),
    };
  }, [userAccount, url]);

  return (
    <Box
      sx={{width: '100%', ...containerSx}}
      display="flex"
      alignItems="center"
      gap={1}>
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
      {!removeNameText && (
        <Typography noWrap variant="body2" sx={labelStyles}>
          {userName}
        </Typography>
      )}
    </Box>
  );
};
