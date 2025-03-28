import {useMemo} from 'react';
import {MenuAction} from 'models/action';
import {useTranslation} from 'react-i18next';
import TableActionMenu from 'components/Table/TableActionMenu';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

interface Props {
  onDelete: () => void;
}

const SubPositionActions = ({onDelete}: Props) => {
  const {t} = useTranslation();

  const options = useMemo<MenuAction[]>(
    () => [
      {
        icon: <DeleteOutlinedIcon />,
        label: t('Remove sub-position'),
        onClick: onDelete,
      },
    ],
    [t, onDelete],
  );

  return <TableActionMenu options={options} />;
};

export default SubPositionActions;
