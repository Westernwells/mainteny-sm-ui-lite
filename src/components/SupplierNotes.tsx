import Notes from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';
import {
  useCreateSupplierComment,
  useDeleteSupplierComment,
  useInfiniteSupplierComments,
  useUpdateSupplierComment,
} from 'hooks/reactQuery/useSupplier';

interface Props {
  supplierId: string;
}

export const SupplierNotes = ({supplierId}: Props) => {
  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteSupplierComments(supplierId, {
    pageIndex: 0,
    pageSize: 10,
  });
  const {mutate: createSupplierComment, isLoading: isCreating} =
    useCreateSupplierComment();
  const {mutate: deleteSupplierComment, isLoading: isDeleting} =
    useDeleteSupplierComment();
  const {mutate: updateSupplierComment, isLoading: isUpdating} =
    useUpdateSupplierComment();

  const createNote = async (
    variables: CreateNoteVars,
    options?: MutateOptions<unknown, any, CreateNoteVars, unknown> | undefined,
  ) => {
    createSupplierComment({...variables, id: supplierId}, {...options});
  };

  const deleteNote = async (
    variables: DeleteNoteVars,
    options?: MutateOptions<unknown, any, DeleteNoteVars, unknown> | undefined,
  ) => {
    deleteSupplierComment({...variables, id: supplierId}, {...options});
  };

  const updateNote = async (
    variables: UpdateNoteVars,
    options?: MutateOptions<unknown, any, UpdateNoteVars, unknown> | undefined,
  ) => {
    updateSupplierComment({...variables, id: supplierId}, {...options});
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
