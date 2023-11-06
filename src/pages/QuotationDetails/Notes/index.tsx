import {useEffect, useMemo, useState, Fragment, useRef} from 'react';
import {useInView} from 'react-intersection-observer';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {Chip, Divider, Drawer, LinearProgress, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {groupBy} from 'lodash';
import {Button} from 'components/Button';
import {FormInput} from 'components/form/FormInput';
import {EmptySection} from 'components/EmptySection';
import {NoteCardSkeleton} from 'components/NoteCardSkeleton';
import {NoteCard} from 'components/NoteCard';
import {ConfirmDelete} from 'components/ConfirmDelete';
import {QuotationView} from 'models/quotation';
import {
  useCreateQuotationComment,
  useDeleteQuotationComment,
  useInfiniteQuotationComments,
  useUpdateQuotationComment,
} from 'hooks/reactQuery/useQuotation';
import {formatTimestamp} from 'utils/datetime';

interface Props {
  quotation: QuotationView;
}

const validationSchema = Yup.object().shape({
  note: Yup.string().required('Note is required'),
});

export const Notes = ({quotation}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const {ref: notesRef, inView: notesInView} = useInView();
  const {
    data: notes = {
      pages: [],
      pageParams: [],
    },
    isLoading: isLoadingNotes,
    isFetchingNextPage: isFetchingNextNotesPage,
    hasNextPage: hasNextNotesPage,
    fetchNextPage: fetchNextNotesPage,
  } = useInfiniteQuotationComments(quotation.id, {
    pageIndex: 0,
    pageSize: 10,
  });
  const {mutate: createQuotationComment} = useCreateQuotationComment();
  const {
    mutate: deleteQuotationComment,
    isLoading: isDeletingQuotationComment,
  } = useDeleteQuotationComment();
  const {
    mutate: updateQuotationComment,
    isLoading: isUpdatingQuotationComment,
  } = useUpdateQuotationComment();
  const notesTopRef = useRef<HTMLElement>();
  const formik = useFormik<{note: string}>({
    initialValues: {
      note: '',
    },
    onSubmit: (values, {setSubmitting}) => {
      if (selectedNoteId) {
        updateQuotationComment(
          {
            quotationId: quotation.id,
            commentId: selectedNoteId,
            body: {
              content: values.note,
              subject: '',
            },
          },
          {
            onSuccess: () => {
              formik.setValues({note: ''});
              setSelectedNoteId('');
            },
            onSettled: () => setSubmitting(false),
          },
        );
      } else {
        createQuotationComment(
          {
            quotationId: quotation.id,
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

  const handleOpenSideDrawer = () => {
    setShowSideDrawer(true);
  };

  const handleCloseSideDrawer = () => {
    setShowSideDrawer(false);
  };

  const renderNotes = () =>
    isLoadingNotes ? (
      <NoteCardSkeleton />
    ) : !isLoadingNotes && !totalNotes ? (
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
      Object.entries(groupedNotes).map(([date, data], index) => (
        <Fragment key={date}>
          <Box
            display="flex"
            alignItems="center"
            py="10px"
            px="1.5rem"
            bgcolor={theme.palette.grey[50]}
            {...(index === 0 && {ref: notesTopRef})}>
            <Typography variant="overline" textTransform="uppercase">
              {t(date)}
            </Typography>
          </Box>

          <Box sx={{width: '100%'}}>
            {data.map((note) => (
              <Fragment key={note.id}>
                <Box ref={notesRef}>
                  <NoteCard
                    note={note}
                    onDelete={() => {
                      setSelectedNoteId(note.id);
                      setIsDeleteDialogOpen(true);
                    }}
                    onEdit={() => {
                      setSelectedNoteId(note.id);
                      formik.setValues({
                        note: note.content,
                      });
                    }}
                  />
                  {selectedNoteId === note.id &&
                  (isDeletingQuotationComment || isUpdatingQuotationComment) ? (
                    <Box height="4px">
                      <LinearProgress />
                    </Box>
                  ) : null}
                  <Divider />
                </Box>
              </Fragment>
            ))}
          </Box>
        </Fragment>
      ))
    );

  return (
    <>
      <Button
        buttonProps={{
          onClick: handleOpenSideDrawer,
          size: 'small',
          variant: 'text',
          sx: {
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          },
        }}>
        <NoteAlt fontSize="small" />
        <Typography variant="subtitle2">{t('Notes')}</Typography>
        <Chip
          label={totalNotes}
          color="primary"
          size="small"
          sx={{
            marginLeft: '0.5rem',
          }}
        />
      </Button>
      <Drawer
        anchor="right"
        open={showSideDrawer}
        onClose={handleCloseSideDrawer}
        PaperProps={{
          sx: {
            width: '30em',
            color: 'text.primary',
            background: 'white',
          },
        }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          position="sticky"
          top={0}
          bgcolor="white"
          py="2rem"
          px="1rem"
          zIndex={99}>
          <Typography variant="h5" letterSpacing="normal">
            {t('Notes')}
          </Typography>
          <Button
            label={t('Close')}
            buttonProps={{
              onClick: handleCloseSideDrawer,
              size: 'small',
              variant: 'text',
            }}
          />
        </Box>

        {renderNotes()}
        {isFetchingNextNotesPage && <NoteCardSkeleton length={1} />}
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
      </Drawer>
      <ConfirmDelete
        open={isDeleteDialogOpen}
        onConfirm={() => {
          deleteQuotationComment(
            {
              quotationId: quotation.id,
              commentId: selectedNoteId,
            },
            {onSettled: () => setSelectedNoteId('')},
          );
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
};
