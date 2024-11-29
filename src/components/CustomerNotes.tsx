import Notes from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';
import {
  useCreateCustomerNote,
  useDeleteCustomerNote,
  useInfiniteCustomerNotes,
  useUpdateCustomerNote,
} from 'hooks/reactQuery/useCustomers';

interface Props {
  propertyOwnerId: string;
  onChange?: () => void;
}

export const CustomerNotes = ({propertyOwnerId, onChange}: Props) => {
  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteCustomerNotes(propertyOwnerId, {
    pageIndex: 0,
    pageSize: 10,
  });
  const {mutate: createCustomerNote, isLoading: isCreating} =
    useCreateCustomerNote(onChange);
  const {mutate: deleteCustomerNote, isLoading: isDeleting} =
    useDeleteCustomerNote(onChange);
  const {mutate: updateCustomerNote, isLoading: isUpdating} =
    useUpdateCustomerNote(onChange);

  const createNote = async (
    variables: CreateNoteVars,
    options?: MutateOptions<unknown, any, CreateNoteVars, unknown> | undefined,
  ) => {
    await createCustomerNote({...variables, id: propertyOwnerId}, {...options});
  };

  const deleteNote = async (
    variables: DeleteNoteVars,
    options?: MutateOptions<unknown, any, DeleteNoteVars, unknown> | undefined,
  ) => {
    await deleteCustomerNote({...variables, id: propertyOwnerId}, {...options});
  };

  const updateNote = async (
    variables: UpdateNoteVars,
    options?: MutateOptions<unknown, any, UpdateNoteVars, unknown> | undefined,
  ) => {
    await updateCustomerNote({...variables, id: propertyOwnerId}, {...options});
  };

  return (
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
  );
};

export default CustomerNotes;
