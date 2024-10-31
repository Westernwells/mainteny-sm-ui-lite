import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Button} from 'components/Button';
import Notes from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';
import {
  useCreateserviceOrderComment,
  useDeleteServiceOrderComment,
  useInfiniteServiceOrderComments,
  useUpdateServiceOrderComment,
} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderView} from 'models/service-order';
import {useTranslation} from 'react-i18next';

type Props = {
  serviceOrder: ServiceOrderView;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const JobNotesDrawer = ({serviceOrder, open, setOpen}: Props) => {
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
  } = useInfiniteServiceOrderComments(serviceOrder.id, {
    pageIndex: 0,
    pageSize: 10,
  });

  const {mutate: createServiceOrderNote, isLoading: isCreating} =
    useCreateserviceOrderComment();
  const {mutate: deleteServiceOrderNote, isLoading: isDeleting} =
    useDeleteServiceOrderComment();
  const {mutate: updateServiceOrderNote, isLoading: isUpdating} =
    useUpdateServiceOrderComment();

  const handleCloseSideDrawer = () => {
    setOpen(false);
  };

  const createNote = async (
    variables: CreateNoteVars,
    options?: MutateOptions<unknown, any, CreateNoteVars, unknown> | undefined,
  ) => {
    createServiceOrderNote(
      {...variables, serviceOrderId: serviceOrder.id},
      {...options},
    );
  };

  const deleteNote = async (
    variables: DeleteNoteVars,
    options?: MutateOptions<unknown, any, DeleteNoteVars, unknown> | undefined,
  ) => {
    deleteServiceOrderNote(
      {...variables, serviceOrderId: serviceOrder.id},
      {...options},
    );
  };

  const updateNote = async (
    variables: UpdateNoteVars,
    options?: MutateOptions<unknown, any, UpdateNoteVars, unknown> | undefined,
  ) => {
    updateServiceOrderNote(
      {...variables, serviceOrderId: serviceOrder.id},
      {...options},
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
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
      <Notes
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

export default JobNotesDrawer;
