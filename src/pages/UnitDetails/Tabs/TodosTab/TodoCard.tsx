import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import {Dialog} from 'components/Dialog';
import {Confirm} from 'components/Confirm';
import {useDeleteTodo, useUpdateTodo} from 'hooks/reactQuery/useElevator';
import {ElevatorComment, ElevatorCommentRecord} from 'models/elevator';
import {useFormatDate} from 'hooks/useFormatDate';
import {EditTodoForm} from './EditTodoForm';

interface Props {
  todo: ElevatorComment;
}

export const TodoCard = ({todo}: Props) => {
  const formatDate = useFormatDate();
  const {t} = useTranslation();
  const {mutate: deleteTodo} = useDeleteTodo();
  const {mutate: updateTodo} = useUpdateTodo();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const validationSchema = Yup.object().shape({
    subject: Yup.string().required('Subject is required'),
  });
  const formik = useFormik<ElevatorCommentRecord>({
    initialValues: {
      subject: todo.subject,
      content: todo.content,
    },
    onSubmit: (values, {resetForm}) => {
      if (todo.refId && todo.id) {
        updateTodo({
          elevatorId: todo.refId,
          todoId: todo.id,
          data: values,
        });
        resetForm();
      }
    },
    validationSchema,
    enableReinitialize: true,
  });

  return (
    <Box
      my="1em"
      p=".75em"
      pr=".5em"
      border="1px solid"
      borderColor="text.disabled"
      borderRadius=".25em">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2">{todo.subject}</Typography>
        <Box>
          <IconButton onClick={() => setIsEditDialogOpen(true)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => setIsDeleteDialogOpen(true)}>
            <DoneIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box display="flex" gap=".25em" my=".25em">
        <Typography variant="subtitle2" color="textSecondary">
          {`${t('Created By')}:`}
        </Typography>
        <Typography variant="subtitle2">
          {todo.meta.creator
            ? `${todo.meta.creator.firstName} ${todo.meta.creator.lastName}`
            : ''}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary" ml="1em">
          {`${t('Date and Time')}:`}
        </Typography>
        <Typography variant="subtitle2">{`${formatDate(
          todo.meta.createdAt,
        )} (${new Date(todo.meta.createdAt).toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
        })})`}</Typography>
      </Box>
      <Typography variant="caption" whiteSpace="pre-wrap" component="p">
        {todo.content}
      </Typography>
      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          if (todo.id) deleteTodo({elevatorId: todo.refId, todoId: todo.id});
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Mark as complete"
        content="Do you want to mark this To-Do as completed?"
        helperText="It will be deleted from the list."
      />
      <Dialog
        title="Edit To-Do"
        onCancel={() => setIsEditDialogOpen(false)}
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onSave={() => {
          formik.handleSubmit();
          setIsEditDialogOpen(false);
        }}
        dialogProps={{
          maxWidth: 'sm',
          open: isEditDialogOpen || false,
        }}>
        <EditTodoForm formik={formik} />
      </Dialog>
    </Box>
  );
};
