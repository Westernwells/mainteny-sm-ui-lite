import SendIcon from '@mui/icons-material/Send';
import {useMemo} from 'react';
import {MenuAction} from 'models/action';
import {useTranslation} from 'react-i18next';
import TableActionMenu from '../../../../../components/Table/TableActionMenu';

interface Props {
  email: string;
}

export const Actions = ({email}: Props) => {
  const {t} = useTranslation();
  const OPTIONS = useMemo<MenuAction[]>(
    () => [
      {
        icon: <SendIcon />,
        label: t('Send email'),
        onClick: () => {
          window.open(`mailto:${email}`, '_blank');
        },
      },
    ],
    [t],
  );

  return <TableActionMenu options={OPTIONS} />;
};
