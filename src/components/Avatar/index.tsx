import {Avatar as AvatarMui, SxProps, Theme} from '@mui/material';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {UserAccount, UserAccountView} from 'models/user';
import {getUserFullName} from 'utils/utils';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface Props {
  userAccount: UserAccountView | UserAccount;
  sx?: SxProps<Theme>;
}

export const Avatar = ({userAccount, sx = {}}: Props) => {
  const filePath = userAccount?.photoUrl;

  const {data} = useDownloadUrl(filePath ? [filePath] : []);
  const url = data?.[filePath];

  return url ? (
    <AvatarMui
      alt={getUserFullName(userAccount)}
      src={url}
      sx={{width: 25, height: 25, ...sx}}
    />
  ) : (
    <AccountCircleIcon sx={{width: 25, height: 25, ...sx}} />
  );
};
