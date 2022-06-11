import {useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useAddElevatorComment,
  useDeleteElevatorComment,
  useQueryElevatorComments,
  useUpdateElevatorComment,
} from 'hooks/reactQuery/useElevator';
import {EmptySection} from 'components/EmptySection';
import {createEmptyResource} from 'utils/paging-utils';
import {ElevatorComment} from 'models/elevator';
import {formatDate} from 'utils/datetime';
import {Dialog} from 'components/Dialog';
import {useFormik} from 'formik';
import {NotesFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {Confirm} from 'components/Confirm';
import {NotesForm} from './NotesForm';

interface Props {
  elevatorId?: string;
}

enum DialogTitle {
  ADD_NOTE = 'Add Note',
  EDIT_NOTE = 'Edit Note',
}

const validationSchema = Yup.object().shape({
  note: Yup.object().nullable().required('Address is required'),
});

export const Notes = ({elevatorId}: Props) => {
  const theme = useTheme();
  const formik = useFormik<NotesFormModel>({
    initialValues: {
      note: '',
    },
    onSubmit: () => {},
    validationSchema,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const totalNotesRef = useRef(0);
  const [dialogTitle, setDialogTitle] = useState('');
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState('');
  const {
    data: elevatorNotesResource = createEmptyResource<ElevatorComment>(10),
    isFetched,
  } = useQueryElevatorComments({pageIndex: 0, pageSize: 50}, elevatorId || '');

  const {mutateAsync: updateNote, isLoading: editElevatorLoading} =
    useUpdateElevatorComment('Notes updated successfully');

  const {mutateAsync: addNote, isLoading: addElevatorLoading} =
    useAddElevatorComment('Notes updated successfully');

  const {mutateAsync: deleteNote} = useDeleteElevatorComment(
    'Notes deleted successfully',
  );

  totalNotesRef.current = totalNotesRef.current || elevatorNotesResource.total;

  const onEditButtonClicked = (noteId: string) => {
    setDialogTitle(DialogTitle.EDIT_NOTE);
    setActiveNoteId(noteId);
    const result = elevatorNotesResource.data.filter(
      (item) => item.id === noteId,
    );
    if (result.length) {
      formik.setFieldValue('note', result[0].content);
    }
    setOpenDialog(true);
  };

  const onSave = async () => {
    if (dialogTitle === DialogTitle.EDIT_NOTE) {
      await updateNote({
        body: {subject: '', content: formik.values.note},
        elevatorId: elevatorId!,
        noteId: activeNoteId,
      });
    } else {
      await addNote({
        body: {subject: '', content: formik.values.note},
        elevatorId: elevatorId!,
      });
    }
    setOpenDialog(false);
  };

  const onDelete = async (noteId: string) => {
    await deleteNote({elevatorId: elevatorId!, noteId});
    setOpenCancelConfirm(false);
  };

  const renderNote = (elevatorNote: ElevatorComment) => (
    <Box
      sx={{
        border: `1px solid ${theme.palette.suvaGrey.light}`,
        p: '0.5em',
        borderRadius: '4px',
        mb: '0.4em',
      }}>
      <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
        <Typography variant="caption">
          {formatDate(elevatorNote.meta.createdAt)} (
          {formatDate(elevatorNote.meta.createdAt, 'HH:mm')}){' '}
        </Typography>
        <Box sx={{display: 'flex'}}>
          <EditIcon
            sx={{color: theme.palette.action.active, cursor: 'pointer'}}
            onClick={() => onEditButtonClicked(elevatorNote.id)}
          />
          <DeleteIcon
            onClick={() => {
              setOpenCancelConfirm(true);
              setActiveNoteId(elevatorNote.id);
            }}
            sx={{color: theme.palette.action.active, cursor: 'pointer'}}
          />
        </Box>
      </Box>
      <Typography variant="subtitle2">
        {`${elevatorNote.meta.creator?.firstName} ${elevatorNote.meta.creator?.lastName}`}
      </Typography>
      <Typography variant="caption">{elevatorNote.content}</Typography>
    </Box>
  );

  return (
    <InfoCard
      containerStyles={{
        [theme.breakpoints.up('md')]: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      showHeaderBackground
      header={
        <Typography component="div" variant="subtitle1">
          Notes
        </Typography>
      }
      handleAction={() => {
        formik.setFieldValue('note', '');
        setOpenDialog(true);
      }}
      headerActionIcon={<Typography color="info.main">+ Add</Typography>}
      bodyContainerStyle={{flexGrow: 1, overflowY: 'scroll'}}>
      {isFetched && !totalNotesRef.current ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}>
          <EmptySection
            label="No notes have been created yet. Please click the button below to create one!"
            showActionBtn
            btnLabel="Add Note"
            illustration="clipboard"
            size="tiny"
            containerStyle={{
              height: '100%',
            }}
          />
        </Box>
      ) : (
        <Box>
          {elevatorNotesResource.data.map((elevator) => renderNote(elevator))}
        </Box>
      )}
      <Dialog
        title={dialogTitle}
        isSaving={editElevatorLoading || addElevatorLoading}
        onCancel={() => setOpenDialog(false)}
        onSave={onSave}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
        }}>
        <NotesForm formik={formik} />
      </Dialog>

      <Confirm
        open={openCancelConfirm}
        onConfirm={() => onDelete(activeNoteId)}
        onClose={() => setOpenCancelConfirm(false)}
        title="Confirm"
        content="Do you want to delete this note?"
      />
    </InfoCard>
  );
};
