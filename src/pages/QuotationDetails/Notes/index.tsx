import {useEffect, useMemo, useState, Fragment} from 'react';
import {useInView} from 'react-intersection-observer';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import NoteAlt from '@mui/icons-material/NoteAlt';
import {Chip, Divider, Drawer, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {groupBy} from 'lodash';
import {Button} from 'components/Button';
import {FormInput} from 'components/form/FormInput';
import {EmptySection} from 'components/EmptySection';
import {QuotationView} from 'models/quotation';
import {useInfiniteQuotationComments} from 'hooks/reactQuery/useQuotation';
import {formatTimestamp} from 'utils/datetime';
import {NoteCard} from './NoteCard';
import {NoteCardSkeleton} from './NoteCardSkeleton';

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
  const formik = useFormik<{note: string}>({
    initialValues: {
      note: '',
    },
    onSubmit: (values) => {
      console.log('🚀 ~ file: index.tsx ~ line 55 ~ Notes ~ values', values);
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
      Object.entries(groupedNotes).map(([date, data]) => (
        <Fragment key={date}>
          <Box
            display="flex"
            alignItems="center"
            py="10px"
            px="1.5rem"
            bgcolor={theme.palette.grey[50]}>
            <Typography variant="overline" textTransform="uppercase">
              {date}
            </Typography>
          </Box>

          <Box sx={{width: '100%'}}>
            {data.map((note) => (
              <Box ref={notesRef} key={note.id}>
                <NoteCard note={note} />
                <Divider />
              </Box>
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
                onKeyDown: (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    formik.handleSubmit();
                  }
                },
              }}
            />
            <Box display="flex" justifyContent="space-between" pt="0.625rem">
              <Typography
                variant="tooltip"
                color={theme.palette.text.secondary}>
                {t('Press Enter to submit note')}
              </Typography>
              <Button
                buttonProps={{
                  type: 'submit',
                  size: 'medium',
                  variant: 'contained',
                  disabled: !formik.isValid,
                }}>
                {t('Submit note')}
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>
    </>
  );
};
