import Delete from '@mui/icons-material/Delete';
import {Confirm} from 'components/Confirm';
import {useDeleteElevator} from 'hooks/reactQuery/useElevator';
import {useState} from 'react';

interface Props {
  id: string;
}

export const Actions = ({id}: Props) => {
  const {mutateAsync: deleteElevator, isLoading: isDeleting} =
    useDeleteElevator('Unit deleted successfully');
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  return (
    <>
      <Delete
        sx={{color: 'action.active'}}
        onClick={() => setOpenDeleteConfirm(true)}
      />
      <Confirm
        disableActions={isDeleting}
        open={openDeleteConfirm}
        onConfirm={async () => {
          await deleteElevator(id!);
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Confirm"
        content="Do you want to delete this unit?"
      />
    </>
  );
};
