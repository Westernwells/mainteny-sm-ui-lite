import Notes from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions, UseInfiniteQueryResult} from 'react-query';
import {
  useCreateCustomerNote,
  useDeleteCustomerNote,
  useInfiniteCustomerNotes,
  useUpdateCustomerNote,
} from 'hooks/reactQuery/useCustomers';
import {Resource, RestError} from 'models/misc';
import {Comment} from 'models/comment';

interface Props {
  customerNotes?: UseInfiniteQueryResult<Resource<Comment>, RestError>;
  propertyOwnerId: string;
  onChange?: () => void;
}

export const CustomerNotes = ({
  customerNotes: explicitCustomerNotes,
  propertyOwnerId,
  onChange,
}: Props) => {
  const implicitCustomerNotes = useInfiniteCustomerNotes(
    propertyOwnerId,
    {
      pageIndex: 0,
      pageSize: 10,
    },
    {
      enabled: !explicitCustomerNotes, // do not call if explicit notes have been passed
    },
  );

  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = explicitCustomerNotes || implicitCustomerNotes;

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
