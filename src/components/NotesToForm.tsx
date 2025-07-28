import {Fragment, useRef, useState} from 'react';
import {useInView} from 'react-intersection-observer';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import {EmptySection} from 'components/EmptySection';
import {FormInput} from 'components/form/FormInput';
import {Button as LoadingButton} from 'components/LoadingButton';
import {useTranslation} from 'react-i18next';
import Divider from '@mui/material/Divider';
import {CreateInvoiceComment, InvoiceFormData} from 'models/invoice';
import Typography from '@mui/material/Typography';
import {Chip} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Edit from '@mui/icons-material/Edit';
import {getUniqueId} from 'utils/utils';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {ConfirmDelete} from 'components/ConfirmDelete';
import {format} from 'date-fns';
import {UseFormReturn} from 'react-hook-form';

interface Props {
  form: UseFormReturn<InvoiceFormData>;
}

const NotesToForm = ({form}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {user} = useUserSession();

  const {setValue, watch} = form;

  const watchedNotes = watch('notes');

  const [activeNote, setActiveNote] = useState<{
    id?: string;
    action: 'edit' | 'delete' | undefined;
  }>({id: undefined, action: undefined});

  const {ref: notesRef} = useInView();
  const formInputRef = useRef<HTMLDivElement>(null);

  const [noteDraft, setNoteDraft] = useState('');

  const onSubmit = () => {
    const newComment: CreateInvoiceComment = {
      content: noteDraft,
      subject: '',
      id: getUniqueId(),
    };

    if (activeNote.id && activeNote.action === 'edit') {
      const updatedNotes = watchedNotes?.map((n: CreateInvoiceComment) =>
        n.id === activeNote.id ? newComment : n,
      );
      setValue('notes', updatedNotes);
      setNoteDraft('');
      setActiveNote({id: undefined, action: undefined});
    } else {
      setValue('notes', [...watchedNotes!, newComment]);
      setNoteDraft('');
    }
  };

  return (
    <>
      {!watchedNotes?.length ? (
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
        <Box sx={{width: '100%'}}>
          {watchedNotes.map((note) => (
            <Fragment key={note.id}>
              <Box ref={notesRef}>
                <Box
                  sx={{
                    py: '1.5em',
                    px: '1em',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      alignItems: 'start',
                      flexDirection: 'column',
                    }}>
                    <Box
                      sx={{
                        display: 'flex',
                        width: '100%',
                        alignTimes: 'cneter',
                        justifyContent: 'space-between',
                      }}
                      gap={1}>
                      <Typography
                        variant="caption"
                        color={theme.palette.text.secondary}>
                        {`${user?.userAccount?.firstName} ${user?.userAccount?.lastName} - `}

                        {activeNote.id === note.id &&
                        activeNote.action === 'edit' ? (
                          <span>
                            <Chip
                              label="Editing"
                              size="small"
                              variant="outlined"
                            />
                          </span>
                        ) : (
                          format(new Date(), 'dd.MM.yyyy, HH:mm')
                        )}
                      </Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setActiveNote({id: note.id, action: 'edit'});
                            if (activeNote.id === note.id) return;
                            setNoteDraft(note.content);
                          }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setActiveNote({id: note.id, action: 'delete'})
                          }>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box display="flex" alignItems="center">
                      <Typography variant="h6" sx={{whiteSpace: 'pre-line'}}>
                        {note.content}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Divider />
              </Box>
            </Fragment>
          ))}
        </Box>
      )}
      <Box
        sx={{
          bgcolor: 'white',
          position: 'sticky',
          mt: 'auto',
          bottom: 0,
          p: '1.5rem',
        }}>
        <form onSubmit={onSubmit}>
          <FormInput
            fieldProps={{
              label: 'Note message',
              size: 'small',
              name: 'noteDraft',
              value: noteDraft,
              onChange: (e) => {
                setNoteDraft(e.target.value);
              },
              multiline: true,
              minRows: 5,
              maxRows: 5,
              inputRef: formInputRef,
            }}
          />

          <Box display="flex" justifyContent="flex-end" pt="0.625rem">
            <LoadingButton
              buttonProps={{
                type: 'submit',
                size: 'medium',
                variant: 'contained',
                disabled: !noteDraft,
              }}>
              {t('Add note')}
            </LoadingButton>
          </Box>
        </form>
      </Box>
      <ConfirmDelete
        open={activeNote.action === 'delete' && activeNote.id !== ''}
        onConfirm={() => {
          const updatedData = watchedNotes?.filter(
            (n) => n.id !== activeNote.id,
          );
          setValue('notes', updatedData);
          setActiveNote({id: undefined, action: undefined});
          setNoteDraft('');
        }}
        onClose={() => {
          setActiveNote({id: '', action: undefined});
          setNoteDraft('');
        }}
      />
    </>
  );
};

export default NotesToForm;
