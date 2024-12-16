import React, {useState} from 'react';
import {DeleteOutlined, EditOutlined} from '@mui/icons-material';
import TableActionMenu from 'components/Table/TableActionMenu';
import {Action} from 'models/table';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

const Actions = ({onEdit, onDelete}: Props) => {
  const [open, setOpen] = useState<boolean>(false);

  const menuActions: Action[] = [
    {
      icon: EditOutlined,
      label: 'Edit',
      onTrigger: () => onEdit(),
    },
    {
      icon: DeleteOutlined,
      label: 'Delete',
      onTrigger: () => onDelete(),
    },
  ];

  return (
    <TableActionMenu options={menuActions} isOpen={open} onToggle={setOpen} />
  );
};

export default React.memo(Actions);
