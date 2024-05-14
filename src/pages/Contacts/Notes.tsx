import {Dispatch, SetStateAction, useState} from 'react';
import NoteAlt from '@mui/icons-material/NoteAlt';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {useTranslation} from 'react-i18next';
import {Button} from 'components/Button';
import NotesList from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';
import {
  useAddContactPersonNote,
  useDeleteContactPersonNote,
  useInfiniteContactPersonNotes,
  useUpdateContactPersonNote,
} from 'hooks/reactQuery/useContacts';

interface Props {
  contactPersonId: string;
  showLabel?: boolean;
  shouldGoBack?: boolean;
  notesCount: number;
}

interface NotesDrawerProps {
  showSideDrawer: boolean;
  setShowSideDrawer: Dispatch<SetStateAction<boolean>>;
  contactPersonId: string;
  shouldGoBack?: boolean;
}
const NotesDrawer = ({
  showSideDrawer,
  setShowSideDrawer,
  contactPersonId,
  shouldGoBack = false,
}: NotesDrawerProps) => {
  const {t} = useTranslation();

  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteContactPersonNotes(contactPersonId, {
    pageIndex: 0,
    pageSize: 10,
  });
  const {mutate: createContactPersonNote, isLoading: isCreating} =
    useAddContactPersonNote();
  const {mutate: deleteContactPersonNote, isLoading: isDeleting} =
    useDeleteContactPersonNote();
  const {mutate: updateContactPersonNote, isLoading: isUpdating} =
    useUpdateContactPersonNote();

  const createNote = async (
    variables: CreateNoteVars,
    options?: MutateOptions<unknown, any, CreateNoteVars, unknown> | undefined,
  ) => {
    await createContactPersonNote(
      {...variables, contactPersonId},
      {...options},
    );
  };

  const deleteNote = async (
    variables: DeleteNoteVars,
    options?: MutateOptions<unknown, any, DeleteNoteVars, unknown> | undefined,
  ) => {
    await deleteContactPersonNote(
      {...variables, contactPersonId},
      {...options},
    );
  };

  const updateNote = async (
    variables: UpdateNoteVars,
    options?: MutateOptions<unknown, any, UpdateNoteVars, unknown> | undefined,
  ) => {
    await updateContactPersonNote(
      {...variables, contactPersonId},
      {...options},
    );
  };

  const handleCloseSideDrawer = () => {
    setShowSideDrawer(false);
  };

  return (
    <Drawer
      anchor="right"
      open={showSideDrawer}
      onClose={handleCloseSideDrawer}
      PaperProps={{
        sx: {
          width: '32rem',
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
        <Box display="flex" alignItems="center">
          {shouldGoBack && (
            <IconButton onClick={handleCloseSideDrawer}>
              <ChevronLeftIcon color="primary" />
            </IconButton>
          )}
          <Typography variant="h5" letterSpacing="normal">
            {t('Contact Notes')}
          </Typography>
        </Box>
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
  );
};

const Notes = ({
  contactPersonId,
  showLabel = false,
  shouldGoBack = false,
  notesCount = 0,
}: Props) => {
  const {t} = useTranslation();
  const [showSideDrawer, setShowSideDrawer] = useState(false);

  return (
    <>
      {showLabel ? (
        <Button
          buttonProps={{
            onClick: (event) => {
              event.stopPropagation();
              setShowSideDrawer(true);
            },
            size: 'small',
            sx: {display: 'flex', gap: '0.5rem'},
          }}>
          <NoteAlt fontSize="small" />
          <Typography variant="body2">{t('Notes')}</Typography>
        </Button>
      ) : (
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            setShowSideDrawer(true);
          }}
          size="small">
          <NoteAlt
            fontSize="small"
            sx={{
              color: notesCount > 0 ? 'primary.main' : 'secondary.mainLight',
            }}
          />
        </IconButton>
      )}

      {showSideDrawer && (
        <NotesDrawer
          showSideDrawer={showSideDrawer}
          setShowSideDrawer={setShowSideDrawer}
          contactPersonId={contactPersonId}
          shouldGoBack={shouldGoBack}
        />
      )}
    </>
  );
};

export default Notes;
