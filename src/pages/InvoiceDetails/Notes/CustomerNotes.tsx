import {FC} from 'react';
import {InvoiceView} from 'models/invoice';
import {
  useInfiniteCustomerNotes,
  useCreateCustomerNote,
  useUpdateCustomerNote,
  useDeleteCustomerNote,
} from 'hooks/reactQuery/useCustomers';
import Notes from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';

interface Props {
  invoice: InvoiceView;
}

export const CustomerNotes: FC<Props> = ({invoice}) => {
  const propertyOwnerId = invoice?.propertyOwner?.id;

  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteCustomerNotes(invoice.propertyOwner.id, {
    pageIndex: 0,
    pageSize: 10,
  });
  const {mutate: createCustomerNote, isLoading: isCreating} =
    useCreateCustomerNote();
  const {mutate: deleteCustomerNote, isLoading: isDeleting} =
    useDeleteCustomerNote();
  const {mutate: updateCustomerNote, isLoading: isUpdating} =
    useUpdateCustomerNote();

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
