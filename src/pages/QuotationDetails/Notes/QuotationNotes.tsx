import {FC} from 'react';
import {
  useCreateQuotationComment,
  useDeleteQuotationComment,
  useInfiniteQuotationComments,
  useUpdateQuotationComment,
} from 'hooks/reactQuery/useQuotation';
import {QuotationView} from 'models/quotation';
import Notes from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';

interface Props {
  quotation: QuotationView;
}

export const QuotationNotes: FC<Props> = ({quotation}) => {
  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuotationComments(quotation.id, {
    pageIndex: 0,
    pageSize: 10,
  });
  const {mutate: createQuotationComment, isLoading: isCreating} =
    useCreateQuotationComment();
  const {mutate: deleteQuotationComment, isLoading: isDeleting} =
    useDeleteQuotationComment();
  const {mutate: updateQuotationComment, isLoading: isUpdating} =
    useUpdateQuotationComment();

  const createNote = async (
    variables: CreateNoteVars,
    options?: MutateOptions<unknown, any, CreateNoteVars, unknown> | undefined,
  ) => {
    await createQuotationComment(
      {...variables, quotationId: quotation.id},
      {...options},
    );
  };

  const deleteNote = async (
    variables: DeleteNoteVars,
    options?: MutateOptions<unknown, any, DeleteNoteVars, unknown> | undefined,
  ) => {
    await deleteQuotationComment(
      {...variables, quotationId: quotation.id},
      {...options},
    );
  };

  const updateNote = async (
    variables: UpdateNoteVars,
    options?: MutateOptions<unknown, any, UpdateNoteVars, unknown> | undefined,
  ) => {
    await updateQuotationComment(
      {...variables, quotationId: quotation.id},
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

export default QuotationNotes;
