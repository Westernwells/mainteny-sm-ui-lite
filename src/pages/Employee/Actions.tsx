import {MouseEvent, useState} from 'react';
import PersonRemoveAlt1 from '@mui/icons-material/PersonRemoveAlt1';
import {Confirm} from 'components/Confirm';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import {useDeleteEmployee} from 'hooks/reactQuery/useEmployee';

interface Props {
  id: string;
  email: string;
}

export const Actions = ({id, email}: Props) => {
  const {mutateAsync: deleteEmployee, isLoading: isDeleting} =
    useDeleteEmployee('Employee removed successfully');
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  return (
    <>
      <Box sx={{display: 'flex'}}>
        <IconButton
          component="a"
          onClick={(e: MouseEvent<HTMLAnchorElement>) => {
            e.stopPropagation();
            window.open(`mailto:${email}`, '_blank');
          }}>
          <SendIcon fontSize="small" sx={{color: 'action.active'}} />
        </IconButton>

        <IconButton component="a" onClick={() => setOpenDeleteConfirm(true)}>
          <PersonRemoveAlt1 sx={{color: 'action.active'}} />
        </IconButton>
      </Box>
      <Confirm
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={async () => {
          await deleteEmployee(id!);
          setOpenDeleteConfirm(false);
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Confirm"
        content="Do you want to remove this employee?"
      />
    </>
  );
};
