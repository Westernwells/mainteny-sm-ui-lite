import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {useMemo, useState} from 'react';
import TableActionMenu from 'components/Table/TableActionMenu';
import {ElevatorDataSchemaView} from 'models/elevator';
import {MenuAction} from 'models/action';
import {useTranslation} from 'react-i18next';

interface Props {
  onPreview: (item: ElevatorDataSchemaView) => void;
  onEdit: (item: ElevatorDataSchemaView) => void;
  onDuplicate: (item: ElevatorDataSchemaView) => void;
  onDelete: (item: ElevatorDataSchemaView) => void;
  item: ElevatorDataSchemaView;
}

const Actions = ({item, onPreview, onEdit, onDuplicate, onDelete}: Props) => {
  const {t} = useTranslation();
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
  };

  const OPTIONS = useMemo<MenuAction[]>(
    () => [
      {
        icon: <RemoveRedEyeOutlinedIcon />,
        label: t('Preview'),
        onClick: () => {
          onPreview(item);
          handleClose();
        },
      },
      {
        icon: <ModeEditOutlineOutlinedIcon />,
        label: t('Edit'),
        onClick: () => {
          onEdit(item);
          handleClose();
        },
      },
      {
        icon: <ContentCopyIcon />,
        label: t('Duplicate'),
        onClick: () => {
          onDuplicate(item);
          handleClose();
        },
      },
      {
        icon: <DeleteOutlineOutlinedIcon />,
        label: t('Delete'),
        onClick: () => {
          onDelete(item);
          handleClose();
        },
      },
    ],
    [item, t],
  );

  return <TableActionMenu options={OPTIONS} isOpen={open} onToggle={setOpen} />;
};

export default Actions;
