import React, {useState} from 'react';
import {DeleteOutlined, EditOutlined} from '@mui/icons-material';
import TableActionMenu from 'components/Table/TableActionMenu';
import {Action} from 'models/table';
import {useTranslation} from 'react-i18next';

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

const Actions = ({onEdit, onDelete}: Props) => {
  const {t} = useTranslation();
  const [open, setOpen] = useState<boolean>(false);

  const menuActions: Action[] = [
    {
      icon: EditOutlined,
      label: t('Edit'),
      onTrigger: () => onEdit(),
    },
    {
      icon: DeleteOutlined,
      label: t('Delete'),
      onTrigger: () => onDelete(),
    },
  ];

  return (
    <TableActionMenu options={menuActions} isOpen={open} onToggle={setOpen} />
  );
};

export default React.memo(Actions);
