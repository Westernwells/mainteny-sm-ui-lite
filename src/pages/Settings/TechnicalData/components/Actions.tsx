import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {useMemo, useState} from 'react';
import {Action} from 'models/table';
import TableActionMenu from 'components/Table/TableActionMenu';
import {ElevatorDataSchemaView} from 'models/elevator';

interface Props {
  onPreview: (item: ElevatorDataSchemaView) => void;
  onEdit: (item: ElevatorDataSchemaView) => void;
  onDuplicate: (item: ElevatorDataSchemaView) => void;
  onDelete: (item: ElevatorDataSchemaView) => void;
  item: ElevatorDataSchemaView;
}

const Actions = ({item, onPreview, onEdit, onDuplicate, onDelete}: Props) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
  };

  const OPTIONS = useMemo<Action[]>(
    () => [
      {
        icon: RemoveRedEyeOutlinedIcon,
        label: 'Preview',
        onTrigger: () => {
          onPreview(item);
          handleClose();
        },
      },
      {
        icon: ModeEditOutlineOutlinedIcon,
        label: 'Edit',
        onTrigger: () => {
          onEdit(item);
          handleClose();
        },
      },
      {
        icon: ContentCopyIcon,
        label: 'Duplicate',
        onTrigger: () => {
          onDuplicate(item);
          handleClose();
        },
      },
      {
        icon: DeleteOutlineOutlinedIcon,
        label: 'Delete',
        onTrigger: () => {
          onDelete(item);
          handleClose();
        },
      },
    ],
    [item],
  );

  return <TableActionMenu options={OPTIONS} isOpen={open} onToggle={setOpen} />;
};

export default Actions;
