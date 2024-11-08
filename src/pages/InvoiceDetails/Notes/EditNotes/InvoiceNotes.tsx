import {InvoiceView} from 'models/invoice';
import {
  useCreateInvoiceComment,
  useDeleteInvoiceComment,
  useInfiniteInvoiceComments,
  useUpdateInvoiceComment,
} from 'hooks/reactQuery/useInvoice';
import Notes from 'components/Notes';
import {CreateNoteVars, DeleteNoteVars, UpdateNoteVars} from 'models/note';
import {MutateOptions} from 'react-query';

interface Props {
  invoice: InvoiceView;
  onChange?: () => void;
}

export const InvoiceNotes = ({invoice, onChange}: Props) => {
  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteInvoiceComments(invoice.id, {
    pageIndex: 0,
    pageSize: 10,
  });
  const {mutate: createInvoiceComment, isLoading: isCreating} =
    useCreateInvoiceComment(onChange);
  const {mutate: deleteInvoiceComment, isLoading: isDeleting} =
    useDeleteInvoiceComment(onChange);
  const {mutate: updateInvoiceComment, isLoading: isUpdating} =
    useUpdateInvoiceComment(onChange);

  const createNote = async (
    variables: CreateNoteVars,
    options?: MutateOptions<unknown, any, CreateNoteVars, unknown> | undefined,
  ) => {
    await createInvoiceComment(
      {...variables, invoiceId: invoice.id},
      {...options},
    );
  };

  const deleteNote = async (
    variables: DeleteNoteVars,
    options?: MutateOptions<unknown, any, DeleteNoteVars, unknown> | undefined,
  ) => {
    await deleteInvoiceComment(
      {...variables, invoiceId: invoice.id},
      {...options},
    );
  };

  const updateNote = async (
    variables: UpdateNoteVars,
    options?: MutateOptions<unknown, any, UpdateNoteVars, unknown> | undefined,
  ) => {
    await updateInvoiceComment(
      {...variables, invoiceId: invoice.id},
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

export default InvoiceNotes;
