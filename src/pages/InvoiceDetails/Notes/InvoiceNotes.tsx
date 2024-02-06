import {useEffect, useMemo, useRef, useState, FC} from 'react';
import {useInView} from 'react-intersection-observer';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import {groupBy} from 'lodash';
import {EmptySection} from 'components/EmptySection';
import {NoteCardSkeleton} from 'components/NoteCardSkeleton';
import {InvoiceView} from 'models/invoice';
import {
  useCreateInvoiceComment,
  useDeleteInvoiceComment,
  useInfiniteInvoiceComments,
  useUpdateInvoiceComment,
} from 'hooks/reactQuery/useInvoice';
import {formatTimestamp} from 'utils/datetime';
import {ConfirmDelete} from 'components/ConfirmDelete';
import {FormInput} from 'components/form/FormInput';
import {Button} from 'components/Button';
import {useTranslation} from 'react-i18next';
import NoteList from 'components/NoteList';

interface Props {
  invoice: InvoiceView;
}

const validationSchema = Yup.object().shape({
  note: Yup.string().required('Note is required'),
});

export const InvoiceNotes: FC<Props> = ({invoice}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const [activeNote, setActiveNote] = useState<{
    id: string;
    action: 'edit' | 'delete' | undefined;
  }>({id: '', action: undefined});

  const notesTopRef = useRef<HTMLElement>();
  const {ref: notesRef, inView: notesInView} = useInView();

  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading: isLoadingNotes,
    isFetchingNextPage,
    hasNextPage: hasNextNotesPage,
    fetchNextPage: fetchNextNotesPage,
  } = useInfiniteInvoiceComments(invoice.id, {
    pageIndex: 0,
    pageSize: 10,
  });
  const {mutate: createInvoiceComment} = useCreateInvoiceComment();
  const {mutate: deleteInvoiceComment, isLoading: isDeleting} =
    useDeleteInvoiceComment();
  const {mutate: updateInvoiceComment, isLoading: isUpdating} =
    useUpdateInvoiceComment();

  const formik = useFormik<{note: string}>({
    initialValues: {
      note: '',
    },
    onSubmit: (values, {setSubmitting}) => {
      if (activeNote.id) {
        updateInvoiceComment(
          {
            invoiceId: invoice.id,
            body: {
              content: values.note,
              subject: '',
            },
            commentId: activeNote.id,
          },
          {
            onSuccess: () => {
              formik.setValues({note: ''});
              setActiveNote({id: '', action: undefined});
            },
            onSettled: () => setSubmitting(false),
          },
        );
      } else {
        createInvoiceComment(
          {
            invoiceId: invoice.id,
            body: {
              content: values.note,
              subject: '',
            },
          },
          {
            onSuccess: () => {
              notesTopRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
              formik.setValues({note: ''});
            },
            onSettled: () => setSubmitting(false),
          },
        );
      }
    },
    validationSchema,
  });

  const totalNotes = useMemo(() => {
    const pages = notes?.pages;
    return pages?.[pages.length - 1]?.total ?? 0;
  }, [notes.pages]);

  const groupedNotes = useMemo(
    () =>
      groupBy(
        notes.pages.flatMap((i) => i.data),
        (note) =>
          `${formatTimestamp(new Date(note.meta.createdAt), 'dd.MM.yyyy')}`,
      ),
    [notes.pages],
  );

  useEffect(() => {
    if (notesInView && hasNextNotesPage) {
      fetchNextNotesPage();
    }
  }, [notesInView]);

  return isLoadingNotes ? (
    <NoteCardSkeleton />
  ) : (
    <>
      {!isLoadingNotes && !totalNotes ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%">
          <EmptySection
            label="No notes yet. They will appear here once added."
            labelVariant="h6"
            illustration="clipboard"
            size="small"
          />
        </Box>
      ) : (
        <NoteList
          groupedNotes={groupedNotes}
          theme={theme}
          formik={formik}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
          notesRef={notesRef}
          notesTopRef={notesTopRef}
          activeNote={activeNote}
          setActiveNote={setActiveNote}
        />
      )}

      {isFetchingNextPage && <NoteCardSkeleton length={1} />}
      <Box
        sx={{
          bgcolor: 'white',
          position: 'sticky',
          mt: 'auto',
          bottom: 0,
          p: '1.5rem',
        }}>
        <form onSubmit={formik.handleSubmit}>
          <FormInput
            props={{
              label: 'Note message',
              size: 'small',
              name: 'note',
              value: formik.values.note,
              onChange: formik.handleChange,
              multiline: true,
              minRows: 5,
              maxRows: 5,
            }}
          />
          <Box display="flex" justifyContent="flex-end" pt="0.625rem">
            <Button
              buttonProps={{
                type: 'submit',
                size: 'medium',
                variant: 'contained',
                disabled: !formik.values.note || formik.isSubmitting,
              }}>
              {t('Submit note')}
            </Button>
          </Box>
        </form>
      </Box>
      <ConfirmDelete
        open={activeNote.action === 'delete'}
        onConfirm={() => {
          deleteInvoiceComment(
            {
              invoiceId: invoice.id,
              commentId: activeNote.id,
            },
            {onSettled: () => setActiveNote({id: '', action: undefined})},
          );
        }}
        onClose={() => {
          setActiveNote({id: '', action: undefined});
          formik.setValues({note: ''});
        }}
      />
    </>
  );
};

export default InvoiceNotes;
