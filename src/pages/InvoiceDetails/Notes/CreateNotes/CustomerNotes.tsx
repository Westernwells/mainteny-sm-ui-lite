import {Dispatch, FC, useEffect} from 'react';
import {
  useInfiniteCustomerNotes,
  useCreateCustomerNote,
  useUpdateCustomerNote,
  useDeleteCustomerNote,
} from 'hooks/reactQuery/useCustomers';
import Notes from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';
import useTotalNotesData from 'hooks/useTotalNotesData';

interface Props {
  customerId: string;
  setTotal: Dispatch<number>;
}

export const CustomerNotes: FC<Props> = ({customerId, setTotal}) => {
  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteCustomerNotes(customerId, {
    pageIndex: 0,
    pageSize: 10,
  });
  const {mutate: createCustomerNote, isLoading: isCreating} =
    useCreateCustomerNote();
  const {mutate: deleteCustomerNote, isLoading: isDeleting} =
    useDeleteCustomerNote();
  const {mutate: updateCustomerNote, isLoading: isUpdating} =
    useUpdateCustomerNote();

  const totalCustomerNotes = useTotalNotesData(
    useInfiniteCustomerNotes,
    customerId,
  );

  useEffect(() => {
    setTotal(totalCustomerNotes || 0);
  }, [totalCustomerNotes]);

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
