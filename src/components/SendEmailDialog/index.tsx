import Dialog from '@mui/material/Dialog';
import {useTranslation} from 'react-i18next';
import {Controller, useForm} from 'react-hook-form';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import {EmailRecord} from 'models/misc';
import {usePublishInvoice} from 'hooks/reactQuery/useInvoice';
import {Button} from 'components/Button';
import {FormInput} from 'components/form/FormInput';
import {usePublishQuotation} from 'hooks/reactQuery/useQuotation';
import React, {useEffect, useMemo, useState} from 'react';
import MultipleAsyncSelect from 'components/MultipleAsyncSelect';
import {
  ServiceCompanyContactPersonOrderField,
  ServiceCompanyContactPersonView,
} from 'models/contacts';
import {fetchServiceCompanyContactPersons} from 'hooks/reactQuery/useContacts';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {FormHelperText, IconButton, InputAdornment} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import RichTextEditor from 'components/RichTextEditor';
import {useFetchCompanyEmailConfig} from 'hooks/reactQuery/useEmail';
import {useCurrentEditor} from '@tiptap/react';
import {EmailSignature} from 'models/employee';
import {EMAIL_ATTACHMENT_SIZE_UPPER_LIMIT} from 'models/email';
import {FileWithPreview} from 'models/files';
import {Order} from '../../models/pagination';

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
  onOpen?: () => void;
  activeSignature?: EmailSignature;
  onSignatureSelect?: (signature?: EmailSignature) => void;
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
  onOpen,
  onSignatureSelect,
}: Props) => {
  const {t} = useTranslation();
  const [isPublishing, setIsPublishing] = useState(false);
  const publish = submitHook?.();
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';
  const {editor} = useCurrentEditor();

  const {data: bccMails} = useFetchCompanyEmailConfig();

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
    getValues,
  } = useForm<EmailRecord>({
    defaultValues: {
      email: email || '',
      subject: subject || '',
      content: content || '',
      emails: email ? [email] : [],
      ccEmails: [],
      bccEmails:
        bccMails?.bccEmails && bccMails.bccEmails.length > 0
          ? bccMails.bccEmails
          : user?.userAccount.contact.email
          ? [user?.userAccount.contact.email]
          : [],
      attachments: [],
    },
  });

  const watchAttachments = watch('attachments');

  const handleResetForm = () => {
    reset();
    setIsCcShown(false);
    setIsBccShown(false);
  };

  const handleCloseDialog = () => {
    handleResetForm();
    editor?.chain().setContent('').run();
    onClose();
    setValue('emails', email ? [email] : []);
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
      ccEmails: values.ccEmails?.length
        ? values.ccEmails
        : [ccEmailsInputValue],
      bccEmails: values.bccEmails?.length
        ? values.bccEmails
        : [bccEmailsInputValue],
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
  const bccEmails = getValues('bccEmails');

  const {fileSize, isFileSizeFormValid} = useMemo(() => {
    const attachmentSize =
      watchAttachments?.reduce((acc, current) => acc + current.size, 0) || 0;

    return {
      fileSize: attachmentSize,
      isFileSizeFormValid: attachmentSize <= EMAIL_ATTACHMENT_SIZE_UPPER_LIMIT,
    };
  }, [watchAttachments]);

  // on entry
  useEffect(() => {
    if (open) onOpen?.();
  }, [open]);

  useEffect(() => {
    if (bccMails?.bccEmails && bccMails.bccEmails.length > 0) {
      setValue('bccEmails', bccMails.bccEmails);
    }
  }, [bccMails]);

  return (
    <Dialog
      open={open || false}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="lg"
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
            filterOptions={(options, {inputValue}) =>
              options.filter((o) => {
                const text =
                  `${o.userAccount?.firstName} ${o.userAccount?.lastName} ${o.userAccount?.contact?.email}`.toLowerCase();
                return text.includes(inputValue?.toLowerCase());
              })
            }
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
                      {!(isBccShown || (bccEmails && bccEmails.length > 0)) && (
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

          {isBccShown || (bccEmails && bccEmails.length > 0) ? (
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
                initialValues={
                  bccEmails
                    ? bccEmails?.map((mails) => ({
                        label: mails,
                        value: mails,
                      }))
                    : []
                }
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

          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <RichTextEditor
              required
              isLoadingFiles={isLoadingFiles}
              label="Text"
              name="content"
              control={control}
              existingFiles={existingFiles}
              updateFiles={(files) => setValue('attachments', files)}
              hasSignatureButton
              onSignatureSelect={(signature?: EmailSignature) => {
                onSignatureSelect?.(signature);
              }}
              updateHtml={(h) => setValue('content', h)}
              html={content}
            />
            {!isFileSizeFormValid && (
              <FormHelperText error>
                {t(
                  'Email files are too big. Supported size {{sizeLimit}} bytes, current size {{currentSize}} bytes',
                  {
                    sizeLimit: EMAIL_ATTACHMENT_SIZE_UPPER_LIMIT,
                    currentSize: fileSize,
                  },
                )}
              </FormHelperText>
            )}
          </Box>
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
                  !isFileSizeFormValid ||
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
