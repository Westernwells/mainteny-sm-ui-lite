import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import {Controller, useForm} from 'react-hook-form';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import {EmailRecord, Order} from 'models/misc';
import {usePublishInvoice} from 'hooks/reactQuery/useInvoice';
import {Button} from 'components/Button';
import {FormInput} from 'components/form/FormInput';
import {usePublishQuotation} from 'hooks/reactQuery/useQuotation';
import React, {useState} from 'react';
import MultipleAsyncSelect from 'components/MultipleAsyncSelect';
import {
  ServiceCompanyContactPersonOrderField,
  ServiceCompanyContactPersonView,
} from 'models/contacts';
import {fetchServiceCompanyContactPersons} from 'hooks/reactQuery/useContacts';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {IconButton, InputAdornment} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import RichTextEditor from 'components/RichTextEditor';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';

interface Props {
  open: boolean;
  onConfirm?: () => void;
  onClose: () => void;
  submitHook?: typeof usePublishInvoice | typeof usePublishQuotation;
  id?: string;
  confirmBtnDisabled?: boolean;
  title?: string;
  confirmBtnLabel?: string;
  email?: string;
  subject?: string;
  content?: string;
  callback?: ({email, subject, content}: EmailRecord) => Promise<void>;
  loadingProgress?: number;
  existingFiles?: FileWithPreview[];
  isLoadingFiles?: boolean;
  isSending?: boolean;
}

interface CustomKeyboardEvent extends React.KeyboardEvent<HTMLDivElement> {
  defaultMuiPrevented?: boolean;
}

export const SendEmailDialog = ({
  open,
  onConfirm,
  onClose,
  submitHook,
  id,
  confirmBtnDisabled,
  title = 'Send email',
  confirmBtnLabel = 'Send email',
  email,
  subject,
  content,
  callback,
  existingFiles,
  isLoadingFiles = false,
  isSending = false,
}: Props) => {
  const {t} = useTranslation();
  const [isPublishing, setIsPublishing] = useState(false);
  const publish = submitHook?.();
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';

  const [emailInputValue, setEmailInputValue] = useState('');
  const [ccEmailsInputValue, setCcEmailsInputValue] = useState('');
  const [bccEmailsInputValue, setBccEmailsInputValue] = useState('');

  const [isCcShown, setIsCcShown] = useState(false);
  const [isBccShown, setIsBccShown] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
    watch,
    setValue,
  } = useForm<EmailRecord>({
    defaultValues: {
      email: email || '',
      subject: subject || '',
      content: content || '',
      emails: email ? [email] : [],
      ccEmails: [],
      bccEmails: [],
      attachments: [],
    },
  });

  const handleResetForm = () => {
    reset();
    setIsCcShown(false);
    setIsBccShown(false);
  };

  const handleKeyDown = (event: CustomKeyboardEvent) => {
    const inputElement = event.target as HTMLInputElement;
    if (event.key === 'Enter' && inputElement.value.trim() === '') {
      // Prevent the default 'Enter' behavior for freeSolo when input is empty.
      event.defaultMuiPrevented = true;
    }
  };

  const onSubmit = async (values: EmailRecord) => {
    const valuesToSubmit = {
      ...values,
      emails: values.emails?.length ? values.emails : [emailInputValue],
      ccEmails: isCcShown
        ? values.ccEmails?.length
          ? values.ccEmails
          : [ccEmailsInputValue]
        : [],
      bccEmails: isBccShown
        ? values.bccEmails?.length
          ? values.bccEmails
          : [bccEmailsInputValue]
        : [],
    };
    if (submitHook && publish && id) {
      setIsPublishing(true);

      publish.mutate(
        {
          id,
          body: valuesToSubmit,
        },
        {
          onSuccess: () => {
            handleResetForm();
            onConfirm?.();
          },
          onSettled: () => {
            setIsPublishing(false);
          },
        },
      );
    } else if (callback) {
      await callback({...valuesToSubmit});
      handleResetForm();
    }
  };

  return (
    <Dialog
      open={open || false}
      onClose={() => {
        onClose();
        setValue('emails', email ? [email] : []);
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          padding: '1.5rem',
        },
      }}>
      <DialogTitle id="alert-dialog-title" sx={{padding: 0}}>
        {t(title)}
      </DialogTitle>
      <DialogContent sx={{p: 0, px: 0, pb: '1.5rem'}}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            pt: '2rem',
            '& .MuiInputBase-root': {
              backgroundColor: '#F7F9FC',
            },
          }}>
          <MultipleAsyncSelect<ServiceCompanyContactPersonView>
            freeSolo
            onKeyDown={handleKeyDown}
            disableClearable
            queryFn={(params) =>
              fetchServiceCompanyContactPersons(serviceCompanyId, {
                ...params,
                pageSize: 3,
                order: Order.DESC,
                orderBy: ServiceCompanyContactPersonOrderField.CREATED_DATE,
              })
            }
            control={control}
            keys={{
              label: 'userAccount.contact.email',
              value: 'userAccount.contact.email',
            }}
            initialValues={[{label: email || '', value: email}]}
            searchableKeys={[
              'userAccount.contact.email',
              'userAccount.lastName',
              'userAccount.firstName',
            ]}
            onInputValueChange={(value: string) => {
              const trimmedValue = value.trim();
              setEmailInputValue(trimmedValue);
            }}
            textFieldProps={{
              label: t('Send to'),
              placeholder:
                (watch('emails')?.length ?? 0) > 0
                  ? ''
                  : t('Search recipients'),
              sx: {
                '.MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
                  // paddingLeft - end adornment width
                  paddingRight: '60px',
                },
              },
              error: !!errors.emails,
              required: true,
              InputProps: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Box display="flex" alignItems="center" gap="0.7rem">
                      {!isCcShown && (
                        <IconButton
                          edge="end"
                          onClick={() => setIsCcShown(true)}>
                          <Typography variant="subtitle2" color="primary.light">
                            {t('Cc')}
                          </Typography>
                        </IconButton>
                      )}
                      {!isBccShown && (
                        <IconButton
                          edge="end"
                          onClick={() => setIsBccShown(true)}>
                          <Typography variant="subtitle2" color="primary.light">
                            {t('Bcc')}
                          </Typography>
                        </IconButton>
                      )}
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
            renderOption={(props, option) => (
              <li
                {...props}
                key={option.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderBottom: '1px solid #EDF1F7',
                  alignItems: 'flex-start',
                }}>
                <Typography>
                  {`${option.userAccount?.firstName} ${option.userAccount?.lastName}` ||
                    '-'}
                </Typography>
                <Typography color="text.secondary">
                  {option.userAccount?.contact?.email || '-'}
                </Typography>
              </li>
            )}
            // disable options that don't have an email
            getOptionDisabled={(option) => !option.userAccount?.contact?.email}
            name="emails"
          />

          {isCcShown ? (
            <Box display="flex" flexWrap="nowrap" alignItems="center">
              <MultipleAsyncSelect<ServiceCompanyContactPersonView>
                freeSolo
                onKeyDown={handleKeyDown}
                queryFn={(params) =>
                  fetchServiceCompanyContactPersons(serviceCompanyId, {
                    ...params,
                    pageSize: 3,
                    order: Order.DESC,
                    orderBy: ServiceCompanyContactPersonOrderField.CREATED_DATE,
                  })
                }
                control={control}
                keys={{
                  label: 'userAccount.contact.email',
                  value: 'userAccount.contact.email',
                }}
                searchableKeys={[
                  'userAccount.contact.email',
                  'userAccount.lastName',
                  'userAccount.firstName',
                ]}
                onInputValueChange={(value: string) => {
                  const trimmedValue = value.trim();
                  setCcEmailsInputValue(trimmedValue);
                }}
                textFieldProps={{
                  label: t('Cc'),
                  placeholder:
                    (watch('ccEmails')?.length ?? 0) > 0
                      ? ''
                      : t('Search recipients'),
                  sx: {
                    '.MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
                      // paddingLeft - end adornment width
                      paddingRight: '60px',
                    },
                  },
                }}
                renderOption={(props, option) => (
                  <li
                    {...props}
                    key={option.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderBottom: '1px solid #EDF1F7',
                      alignItems: 'flex-start',
                    }}>
                    <Typography>
                      {`${option.userAccount?.firstName} ${option.userAccount?.lastName}` ||
                        '-'}
                    </Typography>
                    <Typography color="text.secondary">
                      {option.userAccount?.contact?.email || '-'}
                    </Typography>
                  </li>
                )}
                // disable options that don't have an email
                getOptionDisabled={(option) =>
                  !option.userAccount?.contact?.email
                }
                name="ccEmails"
              />
              <IconButton
                size="small"
                onClick={() => {
                  setIsCcShown(false);
                  setValue('ccEmails', []);
                  setCcEmailsInputValue('');
                }}>
                <CloseOutlinedIcon />
              </IconButton>
            </Box>
          ) : null}

          {isBccShown ? (
            <Box display="flex" flexWrap="nowrap" alignItems="center">
              <MultipleAsyncSelect<ServiceCompanyContactPersonView>
                freeSolo
                onKeyDown={handleKeyDown}
                queryFn={(params) =>
                  fetchServiceCompanyContactPersons(serviceCompanyId, {
                    ...params,
                    pageSize: 3,
                    order: Order.DESC,
                    orderBy: ServiceCompanyContactPersonOrderField.CREATED_DATE,
                  })
                }
                control={control}
                keys={{
                  label: 'userAccount.contact.email',
                  value: 'userAccount.contact.email',
                }}
                searchableKeys={[
                  'userAccount.contact.email',
                  'userAccount.lastName',
                  'userAccount.firstName',
                ]}
                onInputValueChange={(value: string) => {
                  const trimmedValue = value.trim();
                  setBccEmailsInputValue(trimmedValue);
                }}
                textFieldProps={{
                  label: t('Bcc'),
                  placeholder:
                    (watch('bccEmails')?.length ?? 0) > 0
                      ? ''
                      : t('Search recipients'),
                  sx: {
                    '.MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
                      // paddingLeft - end adornment width
                      paddingRight: '60px',
                    },
                  },
                }}
                renderOption={(props, option) => (
                  <li
                    {...props}
                    key={option.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderBottom: '1px solid #EDF1F7',
                      alignItems: 'flex-start',
                    }}>
                    <Typography>
                      {`${option.userAccount?.firstName} ${option.userAccount?.lastName}` ||
                        '-'}
                    </Typography>
                    <Typography color="text.secondary">
                      {option.userAccount?.contact?.email || '-'}
                    </Typography>
                  </li>
                )}
                // disable options that don't have an email
                getOptionDisabled={(option) =>
                  !option.userAccount?.contact?.email
                }
                name="bccEmails"
              />
              <IconButton
                size="small"
                onClick={() => {
                  setIsBccShown(false);
                  setValue('bccEmails', []);
                  setBccEmailsInputValue('');
                }}>
                <CloseOutlinedIcon />
              </IconButton>
            </Box>
          ) : null}

          <Controller
            name="subject"
            control={control}
            render={({field}) => (
              <FormInput
                fieldProps={{
                  ...field,
                  size: 'small',
                  label: 'Subject',
                  required: true,
                  helperText: errors.subject?.message,
                  error: !!errors.subject,
                }}
              />
            )}
          />
          <RichTextEditor
            required
            isLoadingFiles={isLoadingFiles}
            label="Text"
            name="content"
            control={control}
            existingFiles={existingFiles}
            updateFiles={(files) => setValue('attachments', files)}
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          padding: 0,
          paddingTop: '0.5rem',
          justifyContent: 'space-between',
        }}>
        <Button
          buttonProps={{
            size: 'medium',
            variant: 'outlined',
            sx: {
              color: 'text.secondary',
              background: 'transparent',
            },
            onClick: onClose,
          }}>
          <Typography variant="subtitle2">{t('Cancel')}</Typography>
        </Button>
        <Tooltip
          open={confirmBtnDisabled}
          title={t('Send')}
          placement="left"
          arrow>
          <span>
            <Button
              buttonProps={{
                size: 'medium',
                variant: 'contained',
                autoFocus: true,
                disabled:
                  isPublishing ||
                  confirmBtnDisabled ||
                  isSending ||
                  isLoadingFiles ||
                  (!watch('emails')?.length && emailInputValue === '') ||
                  !watch('subject') ||
                  watch('content') === '<p></p>',
                onClick: handleSubmit(onSubmit),
              }}>
              <Typography variant="subtitle2">{t(confirmBtnLabel)}</Typography>
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};
