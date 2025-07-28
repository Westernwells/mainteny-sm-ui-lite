import {useEffect, useRef} from 'react';
import {Button, Drawer, IconButton, Typography} from '@mui/material';
import {Box} from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import capitalize from 'lodash/capitalize';
import {useTranslation} from 'react-i18next';
import {useForm} from 'react-hook-form';
import {
  EXTRA_ASSIGNMENT_OPTIONS,
  NewTaskForm,
  TaskFormRefEntity,
  TaskStatus,
} from 'models/tasks';

import {
  useCreateTask,
  useEditTask,
  useGetTaskById,
} from 'hooks/reactQuery/useTasks';
import {useUserSession} from 'hooks/reactQuery/useUserSession';

import {Progress} from 'components/Progress';
import TaskForm from '../NewTask/TaskForm';

type Props = {
  onClose: () => void;
  taskId?: string;
  mode?: string;
  refEntity?: TaskFormRefEntity;
};

const FORM_DEFAULT_VALUES = {
  name: '',
  description: '',
  status: TaskStatus.TO_DO,
};

const TaskFormDrawer = ({
  taskId,
  mode,
  onClose,
  refEntity: fixedRefEntity,
}: Props) => {
  const {t} = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const {mutateAsync: handleCreateTask} = useCreateTask();
  const {mutateAsync: handleEditTask} = useEditTask(taskId);
  const user = useUserSession();
  const serviceCompanyId = user.user?.userAccount.serviceCompany.id!;
  const {data: task, isLoading: isLoadingTask} = useGetTaskById(taskId);
  const open = mode === 'create' || mode === 'edit';

  const {handleSubmit, setValue, control, reset, watch} = useForm<NewTaskForm>({
    defaultValues: FORM_DEFAULT_VALUES,
    mode: 'all',
  });

  const name = watch('name');
  const isCreateDisabled = !name?.trim();

  const handleClose = () => {
    reset(FORM_DEFAULT_VALUES);
    onClose();
  };

  const onSave = async (data: NewTaskForm) => {
    const assignment = data.assignment ? {...data.assignment} : undefined;

    if (EXTRA_ASSIGNMENT_OPTIONS.includes(assignment?.employeeId!)) {
      delete assignment?.employeeId;
    }

    const fixedRefEntityFormatted =
      fixedRefEntity?.refId && fixedRefEntity?.refType
        ? {id: fixedRefEntity.refId, type: fixedRefEntity.refType}
        : undefined;

    const dataRefEntity =
      data.refEntity?.id && data.refEntity?.type
        ? {id: data.refEntity.id, type: data.refEntity.type}
        : undefined;

    const payload = {
      ...data,
      assignment,
      dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
      tags: data.tags?.map((tag) => tag.id) ?? [],
      refEntity: fixedRefEntityFormatted || dataRefEntity,
    };

    if (mode === 'create') {
      await handleCreateTask({
        ...payload,
        serviceCompanyId,
      });
    }

    if (mode === 'edit') {
      await handleEditTask(payload);
    }

    handleClose();
  };

  const renderView = () => {
    if (isLoadingTask) {
      return (
        <Box width="100%">
          <Progress />
        </Box>
      );
    }

    return (
      <TaskForm
        fixedRefEntity={fixedRefEntity}
        watch={watch}
        setValue={setValue}
        control={control}
      />
    );
  };

  useEffect(() => {
    if (mode === 'edit' && !!task) {
      reset({
        name: task.name || '',
        description: task.description || '',
        status: task.status || TaskStatus.TO_DO,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        tags: task.additionalInfo.tags || [],
        assignment: {
          type: task.assignmentType,
          employeeId: task.assignedEmployee?.id,
        },
        refEntity: {
          type: task.refEntityType,
          id: task.refEntityId,
        },
      });
    } else if (mode === 'create') {
      reset(FORM_DEFAULT_VALUES);
    }
  }, [mode, task]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: '45em',
          color: 'text.primary',
          background: 'white',
          display: 'flex',
        },
      }}>
      <Box
        display="flex"
        position="sticky"
        top={0}
        bgcolor="white"
        zIndex={99}
        data-testid="new-task-drawer-main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: 'inherit',
          boxShadow: 'box-shadow: 0px 4px 15px 0px rgba(144, 144, 144, 0.20);',
        }}>
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '16px 24px',
          }}>
          <Typography variant="h5">
            {capitalize(t(mode === 'create' ? 'New task' : 'Edit task'))}
          </Typography>
          <IconButton onClick={handleClose} disableRipple disableTouchRipple>
            <CloseIcon />
          </IconButton>
        </Box>
        {/* Body Section */}
        <Box
          ref={containerRef}
          sx={{
            display: 'flex',
            width: '100%',
            height: '100%',
            overflow: 'auto',
            padding: '16px 24px',
            paddingTop: 0,
          }}>
          {renderView()}
        </Box>
        {/* Footer Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '16px 24px',
          }}>
          <Box sx={{display: 'flex'}} gap={1.5}>
            <Button
              sx={{
                fontSize: '14px',
                lineHeight: '24px',
                letterSpacing: '0.4px',
                textTransform: 'capitalize',
              }}
              onClick={handleClose}
              color="primary"
              variant="outlined">
              <Typography>{t('Cancel')}</Typography>
            </Button>
            <Button
              sx={{
                fontSize: '14px',
                lineHeight: '24px',
                letterSpacing: '0.4px',
                textTransform: 'capitalize',
              }}
              disabled={isCreateDisabled}
              onClick={handleSubmit(onSave)}
              color="primary"
              variant="contained">
              <Typography>
                {t(mode === 'create' ? 'Create task' : 'Save')}
              </Typography>
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default TaskFormDrawer;
