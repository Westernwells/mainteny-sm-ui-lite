import {useMemo} from 'react';
import {MenuAction} from 'models/action';
import {useTranslation} from 'react-i18next';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PlaylistAddOutlinedIcon from '@mui/icons-material/PlaylistAddOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import TableActionMenu from '../../../../../components/Table/TableActionMenu';

interface Props {
  onPreview: () => void;
  onAddSubPosition?: () => void;
  onDelete: () => void;
  onRemove: () => void;
  isDraft: boolean;
}

export const Actions = ({
  onPreview,
  onAddSubPosition,
  onDelete,
  isDraft,
  onRemove,
}: Props) => {
  const {t} = useTranslation();
  const OPTIONS = useMemo<MenuAction[]>(
    () => [
      ...(!isDraft
        ? [
            {
              icon: <VisibilityOutlinedIcon />,
              label: t('Preview on PDF'),
              onClick: onPreview,
            },
          ]
        : []),
      ...(onAddSubPosition && !isDraft
        ? [
            {
              icon: <PlaylistAddOutlinedIcon />,
              label: t('Add a sub-position'),
              onClick: onAddSubPosition,
            },
          ]
        : []),
      {
        icon: <DeleteOutlinedIcon />,
        label: isDraft ? t('Remove') : t('Delete'),
        onClick: isDraft ? onRemove : onDelete,
      },
    ],
    [t, onPreview, onAddSubPosition, onDelete, onRemove, isDraft],
  );

  return <TableActionMenu options={OPTIONS} />;
};
