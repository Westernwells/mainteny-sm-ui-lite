import {useState} from 'react';
import Delete from '@mui/icons-material/Delete';
import {useDeleteElevator} from 'hooks/reactQuery/useElevator';
import {Confirm} from 'components/Confirm';

interface Props {
  elevatorId: string;
}

export const Actions = ({elevatorId}: Props) => {
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
          await deleteElevator(elevatorId!);
          setOpenDeleteConfirm(false);
        }}
        onClose={() => setOpenDeleteConfirm(false)}
        title="Confirm"
        content="Do you want to delete this unit?"
      />
    </>
  );
};
