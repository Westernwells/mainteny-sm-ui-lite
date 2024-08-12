import {Avatar as AvatarMui, SxProps, Theme} from '@mui/material';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {UserAccountView} from 'models/user';
import {getUserFullName} from 'utils/utils';

interface Props {
  userAccount: UserAccountView;
  sx?: SxProps<Theme>;
}

export const Avatar = ({userAccount, sx = {}}: Props) => {
  const filePath = userAccount.photoUrl;

  const {data} = useDownloadUrl(filePath ? [filePath] : []);
  const url = data?.[filePath];

  return (
    <AvatarMui
      alt={getUserFullName(userAccount)}
      src={url}
      sx={{width: 25, height: 25, ...sx}}
    />
  );
};
