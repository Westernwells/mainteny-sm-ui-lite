import React, {FC, useEffect, useMemo, useRef, useState} from 'react';
import {useInView} from 'react-intersection-observer';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {groupBy} from 'lodash';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import {EmptySection} from 'components/EmptySection';
import {NoteCardSkeleton} from 'components/NoteCardSkeleton';
import {FormInput} from 'components/form/FormInput';
import {Button as LoadingButton} from 'components/LoadingButton';
import {ConfirmDelete} from 'components/ConfirmDelete';
import {useTranslation} from 'react-i18next';
import NoteList from 'components/NoteList';
import {formatTimestamp} from 'utils/datetime';
import {MutateFunction} from 'react-query';
import {
  CreateNoteVars,
  DeleteNoteVars,
  Note,
  UpdateNoteVars,
} from 'models/note';

interface Props {
  notes: {
    pages: {data: Note[]; total: number}[];
  };
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  isDeleting: boolean;
  isUpdating: boolean;
  isCreating: boolean;
  fetchNextPage: () => void;
  createNote: MutateFunction<unknown, any, CreateNoteVars, unknown>;
  updateNote: MutateFunction<unknown, any, UpdateNoteVars, unknown>;
  deleteNote: MutateFunction<unknown, any, DeleteNoteVars, unknown>;
}

const validationSchema = Yup.object().shape({
  note: Yup.string().required('Note is required'),
});

const Notes: FC<Props> = ({
  notes,
  isLoading,
  isFetchingNextPage,
  isDeleting,
  isUpdating,
  isCreating,
  hasNextPage,
  fetchNextPage,
  createNote,
  updateNote,
  deleteNote,
}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const [activeNote, setActiveNote] = useState<{
    id: string;
    action: 'edit' | 'delete' | undefined;
  }>({id: '', action: undefined});

  const notesTopRef = useRef<HTMLElement>();
  const {ref: notesRef, inView: notesInView} = useInView();
  const formInputRef = useRef<HTMLDivElement>(null);

  const formik = useFormik<{note: string}>({
    initialValues: {
      note: '',
    },
    validationSchema,
    onSubmit: (values, {setSubmitting}) => {
      if (activeNote.id && activeNote.action === 'edit') {
        updateNote(
          {
            body: {
              content: values.note,
              subject: '',
            },
            noteId: activeNote.id,
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
        createNote(
          {
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
      setSubmitting(false);
    },
  });

  const totalNotes = useMemo(() => {
    const pages = notes?.pages;
    return pages?.[pages.length - 1]?.total ?? 0;
  }, [notes]);

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
    if (notesInView && hasNextPage) {
      fetchNextPage();
    }
  }, [notesInView]);

  return isLoading ? (
    <NoteCardSkeleton />
  ) : (
    <>
      {!isLoading && !totalNotes ? (
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
          formik={formik}
          notesRef={notesRef}
          notesTopRef={notesTopRef}
          activeNote={activeNote}
          setActiveNote={setActiveNote}
          theme={theme}
          isDeleting={isDeleting}
          isUpdating={isUpdating}
          inputRef={formInputRef}
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
            fieldProps={{
              label: 'Note message',
              size: 'small',
              name: 'note',
              value: formik.values.note,
              onChange: formik.handleChange,
              onKeyPress: (event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  formik.handleSubmit();
                }
              },
              multiline: true,
              minRows: 5,
              maxRows: 5,
              inputRef: formInputRef,
              sx: {paddingTop: 0.5},
            }}
          />
          <span
            style={{color: theme.palette.text.secondary, fontSize: '0.65rem'}}>
            {t('Press Enter to submit note')}
          </span>
          <Box display="flex" justifyContent="flex-end" pt="0.625rem">
            <LoadingButton
              buttonProps={{
                type: 'submit',
                size: 'medium',
                variant: 'contained',
                disabled: !formik.values.note || formik.isSubmitting,
                loading: isCreating || isUpdating,
              }}>
              {t('Submit note')}
            </LoadingButton>
          </Box>
        </form>
      </Box>
      <ConfirmDelete
        open={activeNote.action === 'delete' && activeNote.id !== ''}
        onConfirm={() => {
          deleteNote(
            {
              noteId: activeNote.id,
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

export default Notes;
