import {
  Alert,
  Box,
  IconButton,
  LinearProgress,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {ChangeEvent, useEffect, useState} from 'react';
import {Button} from 'components/Button';
import {Dialog} from 'components/Dialog';
import {
  useCompanyJobTypes,
  useUpdateCompanyJobTypes,
} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {CreateEditViewMode} from 'models/misc';
import {ReactComponent as UnionIcon} from 'assets/icons/union.svg';
import {useTranslation} from 'react-i18next';
import {
  ServiceOrderTypePriority,
  ServiceOrderTypeRecord,
} from 'models/service-order';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import {EditOutlined} from '@mui/icons-material';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import {useFieldArray, useForm} from 'react-hook-form';
import {ConfirmDelete} from 'components/ConfirmDelete';
import {useSnackbar} from 'hooks/useSnackbar';
import {useQueryContract} from 'hooks/reactQuery/useContract';
import {ContractView, ContractOrderField} from 'models/contract';
import {Order} from 'models/pagination';
import {createEmptyResource} from 'utils/paging';
import {debounce} from 'lodash';
import AddJobType, {JobTypeForm} from './AddJobType';
import {
  PriorityCircle,
  StyledDataListCell,
  StyledDataListHeading,
  StyledDataListRow,
  iconMapping,
  priorityColorMap,
  priorityToText,
} from './DataList';

export interface FormState {
  icon: string;
  name: string;
  priority: ServiceOrderTypePriority;
  createInAdvanceDays: number;
}

export interface DeleteEventState {
  userTypedName: string;
  isOpen?: boolean;
  event?: ServiceOrderTypeRecord;
  index?: number;
}

const JobTypes = () => {
  const {user} = useUserSession();
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [openWarningModal, setOpenWarningModal] = useState(false);
  const [dataListMode, setDataListMode] = useState<CreateEditViewMode>('view');
  const [initialJobTypes, setInitialJobTypes] = useState<
    ServiceOrderTypeRecord[]
  >([]);
  const [form, setForm] = useState<FormState>({
    name: '',
    icon: '',
    priority: ServiceOrderTypePriority.LOW,
    createInAdvanceDays: 0,
  });
  const [editingEvent, setEditingEvent] = useState<{
    event?: ServiceOrderTypeRecord;
    index?: number;
  }>({});
  const {enqueueSnackbar} = useSnackbar();
  const {mutateAsync: updateCompanyJobTypes, isLoading: isUpdating} =
    useUpdateCompanyJobTypes();
  const {data: jobTypes, isLoading: loading} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  const [deleteEventState, setDeleteEventState] = useState<DeleteEventState>({
    userTypedName: '',
    isOpen: false,
  });

  const {control, reset, watch} = useForm<JobTypeForm>({
    defaultValues: {
      jobTypes: [],
    },
  });

  const {fields, append, update} = useFieldArray({
    control,
    name: 'jobTypes',
  });

  const watchedFields = watch('jobTypes');

  const handleInputChange = debounce((value) => {
    setDeleteEventState((prevData) => ({
      ...prevData,
      userTypedName: value,
    }));
  }, 50);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleInputChange(event.target.value);
  };

  const {data: contractResource = createEmptyResource<ContractView>(50)} =
    useQueryContract(
      {
        pageIndex: 0,
        pageSize: 50,
        query: '',
        order: Order.DESC,
        orderBy: ContractOrderField.CREATED_TIME,
        serviceOrderType: deleteEventState.userTypedName
          ? [deleteEventState.userTypedName]
          : [],
      },
      {keepPreviousData: true},
    );

  const resetState = () => {
    setEditingEvent({});
    setForm({
      name: '',
      icon: '',
      priority: ServiceOrderTypePriority.LOW,
      createInAdvanceDays: 0,
    });
    setDataListMode('view');
    setDeleteEventState({userTypedName: '', isOpen: false});
  };

  useEffect(() => {
    if (jobTypes && !loading) {
      setInitialJobTypes(jobTypes);
      reset({
        jobTypes,
      });
    }
  }, [jobTypes, loading, reset]);

  const isJobTypesChanged = () => {
    if (watchedFields.length !== initialJobTypes.length) {
      return true;
    }

    return watchedFields?.some((field, index) => {
      const initial = initialJobTypes[index];
      return (
        field.name !== initial.name ||
        field.icon !== initial.icon ||
        field.priority !== initial.priority ||
        field.createInAdvanceDays !== initial.createInAdvanceDays
      );
    });
  };

  const handleCreateOrUpdate = async () => {
    const updatedJobTypes = [...watchedFields];
    let successMessage = 'Job type created successfully';

    if (deleteEventState.event) {
      updatedJobTypes.splice(deleteEventState.index!, 1);
      successMessage = 'Job type deleted successfully';
    }

    await updateCompanyJobTypes({
      companyId: user?.userAccount.serviceCompany.id!,
      body: updatedJobTypes,
    });

    enqueueSnackbar(t(`${successMessage}`), {variant: 'success'});

    resetState();
    setOpenDialog(false);
  };

  const handleDeleteStart = (event: ServiceOrderTypeRecord, index: number) => {
    setDeleteEventState((prevData) => ({
      ...prevData,
      event,
      isOpen: true,
      userTypedName: '',
      index,
    }));
  };

  const onAddNewType = () => {
    setOpenDialog(true);
  };

  const handleDeleteAction = async () => {
    if (contractResource.total > 0) {
      setOpenWarningModal(true);
    } else {
      await handleCreateOrUpdate();
    }
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '1.5em',
        }}>
        <Typography
          variant="h6"
          color="textSecondary"
          textTransform="uppercase"
          textAlign="left"
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row-reverse',
          }}>
          <Tooltip
            title={t(
              'E.g. If you select 15 days, the system will create all jobs for May on the 15th of April. If you select 0 days, the jobs will be created 1st of May.',
            )}
            placement="top"
            arrow>
            <Box sx={{ml: 1, mb: 0.5, cursor: 'pointer'}}>
              <AlertInfoIcon width="16px" height="16px" />
            </Box>
          </Tooltip>
          {t('Job Type Configuration')}
        </Typography>
        <IconButton onClick={onAddNewType}>
          <EditOutlined />
        </IconButton>
      </Box>

      {loading && (
        <LinearProgress sx={{position: 'absolute', width: '100%', bottom: 0}} />
      )}

      {jobTypes?.length && !loading ? (
        <>
          {/* Headers */}
          <Box display="flex" flexDirection="row" sx={{position: 'relative'}}>
            <StyledDataListHeading flex="0 0 8%">
              <Typography variant="h6">{t('Icon')}</Typography>
            </StyledDataListHeading>

            <StyledDataListHeading flex="0 0 32%">
              <Typography variant="h6">{t('Name')}</Typography>
            </StyledDataListHeading>

            <StyledDataListHeading flex="0 0 22%">
              <Typography variant="h6">{t('Priority')}</Typography>
            </StyledDataListHeading>

            <StyledDataListHeading
              flex="0 0 33%"
              sx={{
                alignItems: 'center',
                flexDirection: 'row',
                display: 'flex',
              }}>
              <Tooltip
                title={t(
                  'E.g. If you select 15 days, the system will create all jobs for May on the 15th of April. If you select 0 days, the jobs will be created 1st of May.',
                )}
                placement="top"
                arrow>
                <Box sx={{mr: 1, mb: 0, cursor: 'pointer'}}>
                  <AlertInfoIcon width="16px" height="16px" />
                </Box>
              </Tooltip>
              <Typography variant="h6">{t('Create in advance')}</Typography>
            </StyledDataListHeading>
          </Box>

          {jobTypes?.map((item, index) => {
            const IconComponent =
              iconMapping[item.icon as keyof typeof iconMapping];

            return (
              <StyledDataListRow
                key={`${item.name}-${index}`}
                sx={{
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.3s ease',
                }}>
                <StyledDataListCell flex="0 0 8%">
                  <IconButton>
                    <IconComponent />
                  </IconButton>
                </StyledDataListCell>

                <StyledDataListCell flex="0 0 32%">
                  <Typography ml={1} variant="body2">
                    {serviceOrderTypeToString(item.name) === '-'
                      ? item.name
                      : t(serviceOrderTypeToString(item.name))}
                  </Typography>
                </StyledDataListCell>

                <StyledDataListCell flex="0 0 22%">
                  <Box flex={1}>
                    <Box sx={{alignItems: 'center', display: 'flex'}}>
                      <PriorityCircle
                        color={
                          priorityColorMap[
                            priorityToText(
                              item.priority,
                            ) as keyof typeof priorityColorMap
                          ]
                        }
                      />
                      <Typography color="primary.main" variant="body2">
                        {t(priorityToText(item.priority))}
                      </Typography>
                    </Box>
                  </Box>
                </StyledDataListCell>

                <StyledDataListCell flex="0 0 36%">
                  <Box flex={1}>
                    <Typography color="primary.main" variant="body2">
                      {t(
                        item.createInAdvanceDays === 1
                          ? '{{time}} day'
                          : '{{time}} days',
                        {
                          time: item.createInAdvanceDays,
                        },
                      )}
                    </Typography>
                  </Box>
                </StyledDataListCell>
              </StyledDataListRow>
            );
          })}
        </>
      ) : (
        <>
          <Alert severity="info" sx={{my: 2}}>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{marginTop: 0, color: '#222B45'}}>
              {t('Configure and add custom job types for your specific needs.')}
            </Typography>
          </Alert>

          <Box
            sx={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Box
              sx={{
                fontSize: 48,
                marginTop: 3,
                color: '#B0BEC5',
              }}>
              <UnionIcon />
            </Box>

            <Typography variant="h6" sx={{marginTop: 2}}>
              {t('No types defined')}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{py: 1.5}}>
              {t('Create your custom job types')}
            </Typography>

            <Button
              buttonProps={{
                color: 'primary',
                variant: 'outlined',
                onClick: () => onAddNewType(),
                sx: {
                  textTransform: 'capitalize',
                },
              }}>
              + {t('New Type')}
            </Button>
          </Box>
        </>
      )}

      <Dialog
        title="Job types"
        onCancel={(forceClose?: boolean) => {
          if (forceClose || dataListMode !== 'edit') {
            setOpenDialog(false);
          }

          resetState();
        }}
        onSave={() => {
          handleDeleteAction();
        }}
        saveButtonText="Save changes"
        cancelButtonText="Cancel"
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}
        saveButtonProps={{
          disabled: !isJobTypesChanged(),
        }}
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: 'none',
          },
          '& .MuiDialogContent-root': {
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        dialogContentTextStyles={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
        saveButtonContainerStyles={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
        dialogActionsStyles={{
          padding: '1em 24px 1em 1.5em',
        }}
        dialogContentStyles={{
          mx: 0,
          mt: 0,
          px: 3,
          pb: 0,
          pt: 3,
        }}>
        <AddJobType
          dataListMode={dataListMode}
          setDataListMode={(newValue: CreateEditViewMode) => {
            setDataListMode(newValue);
          }}
          isUpdating={isUpdating}
          onDeleteStart={handleDeleteStart}
          editingEvent={editingEvent}
          setEditingEvent={setEditingEvent}
          form={form}
          setForm={setForm}
          fields={fields}
          append={append}
          reset={reset}
          update={update}
        />
      </Dialog>

      <ConfirmDelete
        confirmText="Delete"
        saveLoading={isUpdating}
        title={t(`Delete job type`)}
        body={[
          t('You are about to delete "{{serviceOrderTypeName}}"', {
            serviceOrderTypeName: deleteEventState.event?.name,
          }),
          t('Enter the type name to confirm deletion.'),
        ]}
        dialogContent={
          <TextField
            value={deleteEventState.userTypedName}
            onChange={onChange}
            size="small"
            placeholder={t('Enter type name')}
            fullWidth
            sx={{mt: 2, mb: 1}}
          />
        }
        buttonSx={{
          bgcolor: 'error.light',
          color: 'primary.contrastText',
          '&:hover': {
            bgcolor: 'error.light',
            color: 'primary.contrastText',
          },
        }}
        disableSave={
          deleteEventState.event?.name !== deleteEventState.userTypedName ||
          isUpdating
        }
        open={deleteEventState.isOpen ?? false}
        onConfirm={() => {
          handleDeleteAction();
        }}
        onClose={() => {
          setDeleteEventState({
            userTypedName: '',
            isOpen: false,
          });
        }}
      />

      <Dialog
        title="Job types"
        onSave={() => {
          setOpenWarningModal(false);
          setDeleteEventState({
            userTypedName: '',
            isOpen: false,
          });
        }}
        saveButtonText="Back"
        dialogProps={{
          maxWidth: 'xs',
          open: openWarningModal || false,
        }}
        showCancelButton={false}
        dialogContentStyles={{
          mx: 0,
          mt: 0,
          px: 3,
          pb: 0,
          pt: 3,
        }}
        saveButtonVariant="text">
        <Alert severity="error" sx={{margin: '20px 0px'}}>
          <Typography variant="h6" gutterBottom>
            {t('Job types used in active contracts cannot be deleted.')}
          </Typography>
          <Typography>
            {t('Number of affected active contracts:')}{' '}
            <strong>{contractResource.total}</strong>
          </Typography>
        </Alert>
      </Dialog>
    </Box>
  );
};

export default JobTypes;
