import {PropsWithChildren} from 'react';
import {
  useCreateCustomerNote,
  useUpdateCustomerNote,
  useDeleteCustomerNote,
} from 'hooks/reactQuery/useCustomers';
import Notes from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {InfiniteData, MutateOptions} from 'react-query';
import {Comment} from 'models/comment';
import {Resource} from '../../../../models/misc';

interface Props {
  customerId: string;
  notes: InfiniteData<Resource<Comment>>;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

export const CustomerNotes = ({
  customerId,
  ...noteProps
}: PropsWithChildren<Props>) => {
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
    await createCustomerNote({...variables, id: customerId}, {...options});
  };

  const deleteNote = async (
    variables: DeleteNoteVars,
    options?: MutateOptions<unknown, any, DeleteNoteVars, unknown> | undefined,
  ) => {
    await deleteCustomerNote({...variables, id: customerId}, {...options});
  };

  const updateNote = async (
    variables: UpdateNoteVars,
    options?: MutateOptions<unknown, any, UpdateNoteVars, unknown> | undefined,
  ) => {
    await updateCustomerNote({...variables, id: customerId}, {...options});
  };

  return (
    <Notes
      isDeleting={isDeleting}
      isUpdating={isUpdating}
      isCreating={isCreating}
      createNote={createNote}
      updateNote={updateNote}
      deleteNote={deleteNote}
      {...noteProps}
    />
  );
};

export default CustomerNotes;
