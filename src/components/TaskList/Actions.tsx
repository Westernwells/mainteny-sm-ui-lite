import React, {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {MenuAction} from 'models/action';
import TableActionMenu from 'components/Table/TableActionMenu';
import {
  CreateTaskBody,
  TASK_STATUS_ICON_COLOR,
  TaskStatus,
  TaskView,
} from 'models/tasks';
import {Confirm} from 'components/Confirm';
import {
  useCreateTask,
  useDeleteTask,
  useEditTask,
} from 'hooks/reactQuery/useTasks';
import CustomSnackbar from 'components/CustomSnackbar';
import {useSnackbar} from 'hooks/useSnackbar';
import MultipleStopOutlinedIcon from '@mui/icons-material/MultipleStopOutlined';
import ArrowRightOutlinedIcon from '@mui/icons-material/ArrowRightOutlined';
import {theme} from 'theme';
import {
  ALL_INTERACTIVE_TASK_STATUS,
  copyTaskLink,
  getTaskStatusStyles,
} from 'utils/tasks';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import CopyAllOutlinedIcon from '@mui/icons-material/CopyAllOutlined';

interface Props {
  task: TaskView;
  setTaskId: (value: string | undefined) => void;
  setMode: (value: string | undefined) => void;
}

const STATUS_ICON_FOR_TABLE_ACTIONS: {[key: string]: React.JSX.Element} = {
  [TaskStatus.TO_DO]: (
    <RuleOutlinedIcon
      htmlColor={TASK_STATUS_ICON_COLOR[TaskStatus.TO_DO].background}
    />
  ),
  [TaskStatus.IN_PROGRESS]: (
    <RefreshOutlinedIcon
      htmlColor={TASK_STATUS_ICON_COLOR[TaskStatus.IN_PROGRESS].background}
    />
  ),
  [TaskStatus.PAUSED]: (
    <PauseOutlinedIcon
      htmlColor={TASK_STATUS_ICON_COLOR[TaskStatus.PAUSED].background}
    />
  ),
  [TaskStatus.DONE]: (
    <CheckCircleOutlineOutlinedIcon
      htmlColor={TASK_STATUS_ICON_COLOR[TaskStatus.DONE].background}
    />
  ),
  [TaskStatus.ARCHIVED]: (
    <Inventory2OutlinedIcon
      htmlColor={TASK_STATUS_ICON_COLOR[TaskStatus.ARCHIVED].background}
    />
  ),
};

const NewActions = ({setTaskId, setMode, task}: Props) => {
  const {t} = useTranslation();

  const [open, setOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {mutateAsync: deleteTask} = useDeleteTask();
  const {enqueueSnackbar} = useSnackbar();
  const {mutateAsync: editTask} = useEditTask(task.id);
  const {mutateAsync: createTask} = useCreateTask(
    'Task duplicated successfully',
  );

  const duplicateTask = () => {
    const payload: CreateTaskBody = {
      name: task.name,
      description: task.description,
      dueDate: task.dueDate,
      tags: task.additionalInfo.tags.map((item) => item.id),
      assignment: {
        type: task.assignmentType,
        employeeId: task.assignedEmployee?.id,
      },
      serviceCompanyId: task.serviceCompanyId,
      status: task.status,
      refEntity: task.refEntityId
        ? {
            type: task.refEntityType!,
            id: task.refEntityId,
          }
        : undefined,
    };

    createTask(payload);
  };

  const actions = useMemo(() => {
    const items: MenuAction[] = [
      {
        label: t('Copy link'),
        icon: <LinkOutlinedIcon />,
        onClick: () => {
          copyTaskLink(task.id);

          enqueueSnackbar(t('Link copied!'), {
            variant: 'success',
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'right',
            },
          });
        },
      },
      {
        label: t('Duplicate'),
        icon: <CopyAllOutlinedIcon />,
        onClick: () => {
          duplicateTask();
        },
      },
      {
        label: t('Edit'),
        icon: <ModeEditOutlineOutlinedIcon />,
        onClick: () => {
          setMode('edit');
          setTaskId(task.id);
        },
      },

      {
        label: t('Move to'),
        icon: (
          <MultipleStopOutlinedIcon htmlColor={theme.palette.primary.light} />
        ),
        subMenu: ALL_INTERACTIVE_TASK_STATUS.map((taskStatus) => {
          const taskStatusDetails = getTaskStatusStyles(taskStatus);
          const isSelected = task.status === taskStatus;

          return {
            label: t(taskStatusDetails.label),
            icon: STATUS_ICON_FOR_TABLE_ACTIONS[taskStatus],
            onClick: () => {
              editTask({status: taskStatus});
            },
            endIcon: isSelected ? (
              <DoneOutlinedIcon sx={{width: '17px', height: '17px'}} />
            ) : null,
          };
        }),
        endIcon: (
          <ArrowRightOutlinedIcon
            sx={{width: '20px', height: '20px'}}
            htmlColor={theme.palette.primary.dark}
          />
        ),
      },
      {
        label: t('Delete'),
        icon: <DeleteOutlineOutlinedIcon />,
        onClick: () => {
          setIsDeleteDialogOpen(true);
        },
      },
    ];

    return items;
  }, [t, task, setMode, setTaskId]);

  return (
    <>
      <TableActionMenu
        testId="task-list-table-actions"
        options={actions}
        isOpen={open}
        onToggle={setOpen}
      />
      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          if (task.id)
            deleteTask(task.id, {
              onSuccess: () => {
                enqueueSnackbar(
                  <CustomSnackbar message="Task deleted" snackIcon="delete" />,
                  {
                    variant: 'info',
                    anchorOrigin: {horizontal: 'right', vertical: 'bottom'},
                  },
                );
              },
            });
          setIsDeleteDialogOpen(false);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete task"
        content={t(`You are about to delete {{taskName}} task.`, {
          taskName: task.name,
        })}
        secondContent="Are you sure about it?"
      />
    </>
  );
};

export default NewActions;
