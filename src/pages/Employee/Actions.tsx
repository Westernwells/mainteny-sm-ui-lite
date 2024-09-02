import {useState} from 'react';
import PersonRemoveAlt1 from '@mui/icons-material/PersonRemoveAlt1';
import {Confirm} from 'components/Confirm';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import {useDeleteEmployee} from 'hooks/reactQuery/useEmployee';

interface Props {
  id: string;
  email: string;
  onClose: () => void;
}

export const Actions = ({id, email, onClose}: Props) => {
  const {mutateAsync: deleteEmployee, isLoading: isDeleting} =
    useDeleteEmployee('Employee removed successfully');
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const handleOpenDeleteConfirm = () => {
    setOpenDeleteConfirm(true);
  };

  const handleClose = () => {
    setOpenDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <Box sx={{display: 'flex'}}>
        <IconButton
          component="a"
          onClick={() => {
            window.open(`mailto:${email}`, '_blank');
          }}>
          <SendIcon fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>

        <IconButton component="a" onClick={handleOpenDeleteConfirm}>
          <PersonRemoveAlt1 sx={{color: 'action.active'}} />
        </IconButton>
      </Box>
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
