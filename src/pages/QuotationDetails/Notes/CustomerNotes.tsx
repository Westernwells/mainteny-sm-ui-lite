import {QuotationView} from 'models/quotation';
import {
  useInfiniteElevatorComments,
  useAddElevatorComment,
  useDeleteElevatorComment,
  useUpdateElevatorComment,
} from 'hooks/reactQuery/useElevator';
import Notes from 'components/Notes';
import {FC} from 'react';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';

interface Props {
  quotation: QuotationView;
}

export const CustomerNotes: FC<Props> = ({quotation}) => {
  const elevatorId = quotation?.elevator?.id;

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
  const {mutate: createCustomerNote} = useAddElevatorComment();
  const {mutate: deleteCustomerNote, isLoading: isDeleting} =
    useDeleteElevatorComment();
  const {mutate: updateCustomerNote, isLoading: isUpdating} =
    useUpdateElevatorComment();

  const createNote = async (
    variables: CreateNoteVars,
    options?: MutateOptions<unknown, any, CreateNoteVars, unknown> | undefined,
  ) => {
    await createCustomerNote({...variables, elevatorId}, {...options});
  };

  const deleteNote = async (
    variables: DeleteNoteVars,
    options?: MutateOptions<unknown, any, DeleteNoteVars, unknown> | undefined,
  ) => {
    await deleteCustomerNote({...variables, elevatorId}, {...options});
  };

  const updateNote = async (
    variables: UpdateNoteVars,
    options?: MutateOptions<unknown, any, UpdateNoteVars, unknown> | undefined,
  ) => {
    await updateCustomerNote({...variables, elevatorId}, {...options});
  };

  return (
    <Notes
      notes={notes}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      isDeleting={isDeleting}
      isUpdating={isUpdating}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      createNote={createNote}
      updateNote={updateNote}
      deleteNote={deleteNote}
    />
  );
};

export default CustomerNotes;
