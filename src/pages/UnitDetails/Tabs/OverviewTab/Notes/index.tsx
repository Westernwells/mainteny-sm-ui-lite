import {useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';
import useTheme from '@mui/material/styles/useTheme';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useQueryElevatorComments,
  useUpdateElevatorComment,
} from 'hooks/reactQuery/useElevator';
import {EmptySection} from 'components/EmptySection';
import {createEmptyResource} from 'utils/paging-utils';
import {ElevatorComment} from 'models/elevator';
import {formatDate} from 'utils/datetime';
import {Dialog} from 'components/Dialog';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {NotesForm} from './NotesForm';
import {NotesFormModel} from '../models';

interface Props {
  elevatorId?: string;
}

const validationSchema = Yup.object().shape({
  address: Yup.object().nullable().required('Address is required'),
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
  const [currentEditNoteId, setCurrentEditNoteId] = useState('');
  const {
    data: elevatorNotesResource = createEmptyResource<ElevatorComment>(10),
    isFetched,
  } = useQueryElevatorComments({pageIndex: 0, pageSize: 50}, elevatorId || '');

  const {mutateAsync: updateNote, isLoading} = useUpdateElevatorComment(
    'Notes updated successfully',
  );

  totalNotesRef.current = totalNotesRef.current || elevatorNotesResource.total;

  const onEditButtonClicked = (noteId: string) => {
    setDialogTitle('Edit Note');
    setCurrentEditNoteId(noteId);
    const result = elevatorNotesResource.data.filter(
      (item) => item.id === noteId,
    );
    if (result.length) {
      formik.setFieldValue('note', result[0].content);
    }
    setOpenDialog(true);
  };

  const onSave = async () => {
    await updateNote({
      body: {subject: '', content: formik.values.note},
      elevatorId: elevatorId!,
      noteId: currentEditNoteId,
    });
    setOpenDialog(false);
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
          <DeleteIcon sx={{color: theme.palette.action.active}} />
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
        isSaving={isLoading}
        onCancel={() => setOpenDialog(false)}
        onSave={onSave}
        dialogProps={{
          maxWidth: 'sm',
          open: openDialog || false,
        }}>
        <NotesForm formik={formik} />
      </Dialog>
    </InfoCard>
  );
};
