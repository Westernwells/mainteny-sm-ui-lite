import {useMemo} from 'react';
import {MenuAction} from 'models/action';
import {useTranslation} from 'react-i18next';
import TableActionMenu from 'components/Table/TableActionMenu';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

interface Props {
  isMixedType: boolean;
  onCreateMixedPosition: () => void;
  onAddSubPosition: () => void;
  onSaveToCatalogue: () => void;
  onDelete: () => void;
  isOpen?: boolean;
}

const MainPositionActions = ({
  isMixedType,
  onCreateMixedPosition,
  onAddSubPosition,
  onSaveToCatalogue,
  onDelete,
  isOpen,
}: Props) => {
  const {t} = useTranslation();

  const options = useMemo<MenuAction[]>(() => {
    const baseActions: MenuAction[] = [
      {
        icon: <SaveOutlinedIcon />,
        label: t('Save to catalogue'),
        onClick: onSaveToCatalogue,
      },
      {
        icon: <DeleteOutlinedIcon />,
        label: t('Delete'),
        onClick: onDelete,
      },
    ];

    if (isMixedType) {
      return [
        {
          icon: <PlaylistAddOutlinedIcon />,
          label: t('Add a sub-position'),
          onClick: onAddSubPosition,
        },
        ...baseActions,
      ];
    }
    return [
      {
        icon: <Inventory2OutlinedIcon />,
        label: t('Create mixed position'),
        onClick: onCreateMixedPosition,
      },
      ...baseActions,
    ];
  }, [
    t,
    isMixedType,
    onCreateMixedPosition,
    onAddSubPosition,
    onSaveToCatalogue,
    onDelete,
  ]);

  return <TableActionMenu options={options} isOpen={isOpen} />;
};

export default MainPositionActions;
