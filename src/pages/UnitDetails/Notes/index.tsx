import {useState} from 'react';
import NoteAlt from '@mui/icons-material/NoteAlt';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import {
  useAddElevatorComment,
  useDeleteElevatorComment,
  useInfiniteElevatorComments,
  useUpdateElevatorComment,
} from 'hooks/reactQuery/useElevator';
import useTotalNotesData from 'hooks/useTotalNotesData';
import NotesList from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';

interface Props {
  elevatorId: string;
}

const Notes = ({elevatorId}: Props) => {
  const {t} = useTranslation();
  const [showSideDrawer, setShowSideDrawer] = useState(false);

  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteElevatorComments(elevatorId, {
    pageIndex: 0,
    pageSize: 10,
  });
  const {mutate: createElevatorNote, isLoading: isCreating} =
    useAddElevatorComment();
  const {mutate: deleteElevatorNote, isLoading: isDeleting} =
    useDeleteElevatorComment();
  const {mutate: updateElevatorNote, isLoading: isUpdating} =
    useUpdateElevatorComment();

  const createNote = async (
    variables: CreateNoteVars,
    options?: MutateOptions<unknown, any, CreateNoteVars, unknown> | undefined,
  ) => {
    await createElevatorNote({...variables, elevatorId}, {...options});
  };

  const deleteNote = async (
    variables: DeleteNoteVars,
    options?: MutateOptions<unknown, any, DeleteNoteVars, unknown> | undefined,
  ) => {
    await deleteElevatorNote({...variables, elevatorId}, {...options});
  };

  const updateNote = async (
    variables: UpdateNoteVars,
    options?: MutateOptions<unknown, any, UpdateNoteVars, unknown> | undefined,
  ) => {
    await updateElevatorNote({...variables, elevatorId}, {...options});
  };

  const totalCustomerNotes = useTotalNotesData(
    useInfiniteElevatorComments,
    elevatorId,
  );

  const handleOpenSideDrawer = () => {
    setShowSideDrawer(true);
  };

  const handleCloseSideDrawer = () => {
    setShowSideDrawer(false);
  };

  return (
    <>
      <Button
        buttonProps={{
          onClick: handleOpenSideDrawer,
          size: 'small',
          variant: 'text',
          sx: {
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          },
        }}>
        <NoteAlt fontSize="small" />
        <Typography>{t('Notes')}</Typography>
        <Chip
          label={totalCustomerNotes}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
            color: 'white',
          }}
        />
      </Button>
      <Drawer
        anchor="right"
        open={showSideDrawer}
        onClose={handleCloseSideDrawer}
        PaperProps={{
          sx: {
            width: '30em',
            color: 'text.primary',
            background: 'white',
          },
        }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          position="sticky"
          top={0}
          bgcolor="white"
          py="2rem"
          px="1rem"
          zIndex={99}>
          <Typography variant="h5" letterSpacing="normal">
            {t('Notes')}
          </Typography>
          <Button
            label={t('Close')}
            buttonProps={{
              onClick: handleCloseSideDrawer,
              size: 'small',
              variant: 'text',
            }}
          />
        </Box>
        <NotesList
          notes={notes}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
          isCreating={isCreating}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          createNote={createNote}
          updateNote={updateNote}
          deleteNote={deleteNote}
        />
      </Drawer>
    </>
  );
};

export default Notes;
