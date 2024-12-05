import Typography from '@mui/material/Typography';
import {Dialog} from 'components/Dialog';
import {EmptySection} from 'components/EmptySection';
import {InfoCard} from 'components/InfoCard';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

import {useQueryState} from 'hooks/useQueryState';
import {makePage} from 'utils/paging';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useFetchElevatorDataSchemas} from 'hooks/reactQuery/useCompanies';
import {Box} from '@mui/system';
import {Button} from 'components/Button';
import {CircularProgress, TextField} from '@mui/material';
import {
  ElevatorDataMigrationItem,
  ElevatorDataSchemaItemWithState,
  ElevatorDataSchemaView,
} from 'models/elevator';
import {
  useCreateElevatorDataSchemas,
  useDeleteElevatorDataSchemas,
  useEditElevatorDataSchemas,
} from 'hooks/reactQuery/useElevatorDataSchemas';
import {ConfirmDelete} from 'components/ConfirmDelete';
import {AddTechnicalData} from './AddTechnicalData';
import TechnicalDataFilledView from './TechnicalDataFilledView';
import {ViewTechnicalData} from './ViewTechnicalData';

type DialogState = {
  open: boolean;
  mode: 'view' | 'create' | 'edit';
  selectedSchema?: ElevatorDataSchemaView;
};

type DeleteDialogState = {
  open: boolean;
  selectedSchema?: ElevatorDataSchemaView;
  userTypedCategoryName?: string;
};

const DEFAULT_DIALOG_STATE: DialogState = {
  open: false,
  mode: 'create',
};

const DEFAULT_DELETE_DIALOG_STATE: DeleteDialogState = {
  open: false,
  userTypedCategoryName: '',
};

const TechnicalData = () => {
  const {t} = useTranslation();
  const [dialogState, setDialogState] =
    useState<DialogState>(DEFAULT_DIALOG_STATE);
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>(
    DEFAULT_DELETE_DIALOG_STATE,
  );

  const [page, setPage] = useQueryState('page', {
    defaultValue: makePage(0, 25),
  });
  const [searchQuery, setSearchQuery] = useQueryState('search', {
    defaultValue: '',
  });

  const {user} = useUserSession();
  const [categoryName, setCategoryName] = useState('');
  const [items, setItems] = useState<ElevatorDataSchemaItemWithState[]>([]);
  const {
    mutateAsync: createElevatorDataSchema,
    isLoading: isCreatingElevatorData,
  } = useCreateElevatorDataSchemas('Technical data category created');
  const {
    mutateAsync: editElevatorDataSchema,
    isLoading: isEditingElevatorData,
  } = useEditElevatorDataSchemas('Technical data updated successfully');
  const {
    mutateAsync: deleteElevatorDataSchema,
    isLoading: isDeletingElevatorData,
  } = useDeleteElevatorDataSchemas('Technical data deleted successfully');
  const {data: elevatorDataSchemaResource, isLoading} =
    useFetchElevatorDataSchemas(user?.userAccount.serviceCompany.id!, {
      ...page,
      query: searchQuery,
    });

  const isSaveDisabled = !categoryName;

  const resetForm = () => {
    setCategoryName('');
    setItems([]);
  };

  const closeModal = () => {
    setDialogState(DEFAULT_DIALOG_STATE);
    resetForm();
  };

  const openAddDialog = () => {
    setDialogState({open: true, mode: 'create'});
  };

  const openEditDialog = (elevatorData: ElevatorDataSchemaView) => {
    setDialogState({open: true, mode: 'edit', selectedSchema: elevatorData});
    setCategoryName(elevatorData.name);
    setItems(
      elevatorData.additionalInfo.items.map((item) => ({
        ...item,
        isEditing: false,
        fromDatabase: true,
      })),
    );
  };

  const openPreviewDialog = (item: ElevatorDataSchemaView) => {
    setDialogState({open: true, mode: 'view', selectedSchema: item});
  };

  const isEmpty =
    !isLoading && !elevatorDataSchemaResource?.data.length && !searchQuery;

  const handleSave = async () => {
    const dataMigrationItems: ElevatorDataMigrationItem[] = [];

    const bodyItems = items.map((item) => {
      if (item.dataMigrationItem?.fromName && item.dataMigrationItem.toName) {
        dataMigrationItems.push(item.dataMigrationItem);
      }

      return {
        name: item.name,
        type: item.type,
        unit: item.unit,
      };
    });

    if (dialogState.mode === 'create') {
      await createElevatorDataSchema({
        body: {
          name: categoryName,
          items: bodyItems,
          serviceCompanyId: user?.userAccount.serviceCompany.id!,
        },
      });
    }

    if (dialogState.mode === 'edit') {
      await editElevatorDataSchema({
        schemaId: dialogState.selectedSchema?.id!,
        body: {
          name: categoryName,
          items: bodyItems,
          dataMigrationItems,
        },
      });
    }

    closeModal();
  };

  const handleDelete = async () => {
    await deleteElevatorDataSchema({
      schemaId: deleteDialogState.selectedSchema?.id!,
    });

    setDeleteDialogState(DEFAULT_DELETE_DIALOG_STATE);
  };

  const openDeleteModal = (schema: ElevatorDataSchemaView) => {
    setDeleteDialogState({
      open: true,
      selectedSchema: schema,
      userTypedCategoryName: '',
    });
    closeModal();
  };

  const openDuplicateModal = (schema: ElevatorDataSchemaView) => {
    setDialogState({open: true, mode: 'create'});
    setCategoryName(schema.name);
    setItems(
      schema.additionalInfo.items.map((item) => ({
        ...item,
        isEditing: false,
        fromDatabase: false,
      })),
    );
  };

  const renderRightFooterButton = () => {
    const shouldShowDelete =
      dialogState.mode === 'edit' || dialogState.mode === 'view';

    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: shouldShowDelete ? 'space-between' : 'flex-end',
        }}>
        {shouldShowDelete && (
          <Button
            buttonProps={{
              size: 'medium',
              variant: 'text',
              onClick: () => {
                openDeleteModal(dialogState.selectedSchema!);
              },
              autoFocus: true,
              sx: {mr: 1},

              disabled: false,
            }}>
            <Typography color="rgba(252, 85, 85, 1)" variant="subtitle2">
              {t('Delete Category')}
            </Typography>
          </Button>
        )}
        <Box>
          <Button
            buttonProps={{
              size: 'medium',
              variant: 'text',
              onClick: closeModal,
              autoFocus: true,
              sx: {mr: 1},

              disabled: false,
            }}>
            <Typography variant="subtitle2">{t('Cancel')}</Typography>
          </Button>
          {dialogState.mode === 'view' ? (
            <Button
              buttonProps={{
                size: 'medium',
                variant: 'contained',
                onClick: () => {
                  openEditDialog(dialogState.selectedSchema!);
                },
                autoFocus: true,
              }}>
              <Typography variant="subtitle2">{t('Edit')}</Typography>
            </Button>
          ) : (
            <Button
              buttonProps={{
                size: 'medium',
                variant: 'contained',
                onClick: () => {
                  handleSave();
                },
                autoFocus: true,
                startIcon: isCreatingElevatorData && (
                  <CircularProgress size={15} />
                ),
                disabled:
                  isSaveDisabled ||
                  isCreatingElevatorData ||
                  isEditingElevatorData,
              }}>
              <Typography variant="subtitle2">{t('Save')}</Typography>
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  const getDialogTitle = () => {
    if (dialogState.mode === 'edit') {
      return 'Edit Technical Data';
    }

    if (dialogState.mode === 'view') {
      return dialogState.selectedSchema?.name!;
    }

    return 'New Technical Data';
  };

  return (
    <>
      <InfoCard
        header={
          <Typography variant="subtitle1">{t('Technical Data')}</Typography>
        }
        showHeaderBackground
        bodyContainerStyle={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '0 !important',
        }}
        containerStyles={{
          mt: 1.5,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}>
        {isEmpty ? (
          <EmptySection
            label="No Technical Data"
            size="tiny"
            showActionBtn
            btnLabel="New Technical Data"
            btnAction={openAddDialog}
            subLabel="Add a data category to speed up your workflow"
            containerStyle={{height: '100%', my: '2em'}}
            illustration="hierarchy"
            subLabelProps={{sx: {color: '#828DA3', mt: 1}}}
          />
        ) : (
          <TechnicalDataFilledView
            onOpenEditDialog={openEditDialog}
            onDuplicate={openDuplicateModal}
            onOpenDeleteDialog={openDeleteModal}
            onOpenPreviewDialog={openPreviewDialog}
            page={page}
            setPage={setPage}
            dataResource={elevatorDataSchemaResource}
            onOpenAddDialog={openAddDialog}
            searchQuery={searchQuery}
            onSearchTextChange={(event) => {
              setSearchQuery(event.target.value);
            }}
          />
        )}
      </InfoCard>
      <Dialog
        title={getDialogTitle()}
        onCancel={closeModal}
        onSave={() => {}}
        showCancelButton={false}
        dialogProps={{
          maxWidth: dialogState.mode === 'view' ? 'xs' : 'sm',
          open: dialogState.open,
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
        renderRightFooterButton={renderRightFooterButton}
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
        {dialogState.mode === 'view' ? (
          <ViewTechnicalData schema={dialogState.selectedSchema!} />
        ) : (
          <AddTechnicalData
            categoryName={categoryName}
            setCategoryName={setCategoryName}
            items={items}
            mode={dialogState.mode}
            setItems={setItems}
          />
        )}
      </Dialog>
      <ConfirmDelete
        confirmText="Delete"
        saveLoading={isDeletingElevatorData}
        title={t(`Delete Technical Data`)}
        body={[
          t('You are about to delete {{categoryName}}.', {
            categoryName: deleteDialogState.selectedSchema?.name,
          }),
          t('Enter the data category name to confirm deletion.'),
        ]}
        dialogContent={
          <TextField
            value={deleteDialogState.userTypedCategoryName}
            onChange={(e) => {
              setDeleteDialogState((prevData) => ({
                ...prevData,
                userTypedCategoryName: e.target.value,
              }));
            }}
            size="small"
            placeholder={t('Enter category name')}
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
          deleteDialogState.selectedSchema?.name?.toLowerCase() !==
            deleteDialogState.userTypedCategoryName?.toLowerCase() ||
          isDeletingElevatorData
        }
        open={deleteDialogState.open ?? false}
        onConfirm={() => {
          handleDelete();
        }}
        onClose={() => {
          setDeleteDialogState(DEFAULT_DELETE_DIALOG_STATE);
        }}
      />
    </>
  );
};

export default TechnicalData;
