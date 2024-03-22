import {FC} from 'react';
import Notes from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';
import {ContractView} from 'models/contract';
import {
  useCreateContractComment,
  useDeleteContractComment,
  useInfiniteContractComments,
  useUpdateContractComment,
} from 'hooks/reactQuery/useContract';

interface Props {
  contract: ContractView;
}

export const ContractNotes: FC<Props> = ({contract}) => {
  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteContractComments(contract.id, {
    pageIndex: 0,
    pageSize: 10,
  });
  const {mutate: createContractComment, isLoading: isCreating} =
    useCreateContractComment();
  const {mutate: deleteContractComment, isLoading: isDeleting} =
    useDeleteContractComment();
  const {mutate: updateContractComment, isLoading: isUpdating} =
    useUpdateContractComment();

  const createNote = async (
    variables: CreateNoteVars,
    options?: MutateOptions<unknown, any, CreateNoteVars, unknown> | undefined,
  ) => {
    await createContractComment(
      {...variables, contractId: contract.id},
      {...options},
    );
  };

  const deleteNote = async (
    variables: DeleteNoteVars,
    options?: MutateOptions<unknown, any, DeleteNoteVars, unknown> | undefined,
  ) => {
    await deleteContractComment(
      {...variables, contractId: contract.id},
      {...options},
    );
  };

  const updateNote = async (
    variables: UpdateNoteVars,
    options?: MutateOptions<unknown, any, UpdateNoteVars, unknown> | undefined,
  ) => {
    await updateContractComment(
      {...variables, contractId: contract.id},
      {...options},
    );
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

export default ContractNotes;
