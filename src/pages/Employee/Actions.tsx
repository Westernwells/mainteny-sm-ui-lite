import {useRef, useState} from 'react';
import PersonRemoveAlt1 from '@mui/icons-material/PersonRemoveAlt1';
import {Confirm} from 'components/Confirm';
import SendIcon from '@mui/icons-material/Send';
import {useDeleteEmployee} from 'hooks/reactQuery/useEmployee';
import TableActionMenu from '../../components/TableActionMenu';
import {Action} from '../../models/table';

interface Props {
  id: string;
  email: string;
}

export const Actions = ({id, email}: Props) => {
  const {mutateAsync: deleteEmployee, isLoading: isDeleting} =
    useDeleteEmployee('Employee removed successfully');
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [open, setOpen] = useState<boolean>(false);

  const handleOpenDeleteConfirm = () => {
    setOpenDeleteConfirm(true);
  };

  const handleClose = () => {
    setOpenDeleteConfirm(false);
    setOpen(false);
  };

  const OPTIONS = useRef<Action[]>([
    {
      icon: SendIcon,
      label: 'Send email',
      onTrigger: () => {
        window.open(`mailto:${email}`, '_blank');
      },
    },
    {
      icon: PersonRemoveAlt1,
      label: 'Remove Employee',
      onTrigger: handleOpenDeleteConfirm,
    },
  ]);

  return (
    <>
      <TableActionMenu
        options={OPTIONS.current}
        isOpen={open}
        onToggle={setOpen}
      />
      <Confirm
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={async () => {
          await deleteEmployee(id!);
          handleClose();
        }}
        onClose={handleClose}
        title="Confirm"
        content="Do you want to remove this employee?"
      />
    </>
  );
};
