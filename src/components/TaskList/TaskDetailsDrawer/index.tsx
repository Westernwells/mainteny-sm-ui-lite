import {Box, Drawer, IconButton, Typography} from '@mui/material';
import {useRef, useState} from 'react';
import {useScrollVerticalPosition} from 'hooks/useScrollPosition';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import {useDeleteTask, useGetTaskById} from 'hooks/reactQuery/useTasks';
import {useSnackbar} from 'hooks/useSnackbar';
import {Delete, Edit} from '@mui/icons-material';
import {ThreeDotMenu} from 'components/ThreeDotMenu';
import {useTranslation} from 'react-i18next';
import {Confirm} from 'components/Confirm';
import CustomSnackbar from 'components/CustomSnackbar';
import {copyTaskLink} from 'utils/tasks';
import TaskDetails from './TaskDetails';

type Props = {
  onClose: () => void;
  open?: boolean;
  taskId?: string;
  setMode: (value: string | undefined) => void;
  setTaskId: (value: string | undefined) => void;
};

const TaskDetailsDrawer = ({
  onClose,
  taskId,
  setMode,
  setTaskId,
  open = false,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scroller = useScrollVerticalPosition(containerRef?.current ?? null);
  const {data: task, isLoading} = useGetTaskById(taskId);

  const {t} = useTranslation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {mutateAsync: deleteTask} = useDeleteTask();
  const {enqueueSnackbar} = useSnackbar();

  const handleClose = () => {
    onClose();
  };

  const handleCopy = () => {
    copyTaskLink(taskId!);

    enqueueSnackbar(t('Link copied!'), {
      variant: 'success',
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'right',
      },
    });
  };

  const onEdit = () => {
    setMode('edit');
  };

  const onDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: '40em',
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
          data-testid="task-details-drawer-main"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            height: 'inherit',
            boxShadow:
              'box-shadow: 0px 4px 15px 0px rgba(144, 144, 144, 0.20);',
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
            <Typography variant="h5">{task?.name}</Typography>
            <Box display="flex" flexDirection="row">
              <IconButton onClick={handleCopy}>
                <LinkOutlinedIcon />
              </IconButton>
              <ThreeDotMenu
                hideTooltip
                actions={[
                  {
                    label: t('Edit'),
                    onClick: () => {
                      onEdit();
                    },
                    icon: <Edit />,
                  },
                  {
                    label: t('Delete'),
                    onClick: () => {
                      onDelete();
                    },
                    icon: <Delete />,
                  },
                ]}
              />
            </Box>
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

              ...(!scroller.isAtStart &&
                !scroller.isAtEnd && {
                  borderRight: 0,
                  borderLeft: 0,
                  boxShadow: '0 0 14px rgba(0,0,0,0.2)',
                  clipPath: 'inset(-14px 0 -14px 0)',
                }),

              ...(!scroller.isAtStart &&
                scroller.isAtEnd && {
                  borderRight: 0,
                  boxShadow: '0 0 14px rgba(0,0,0,0.2)',
                  clipPath: 'inset(-14px 0 0 0)',
                }),

              ...(!scroller.isAtEnd &&
                scroller.isAtStart && {
                  borderLeft: 0,
                  boxShadow: '0 0 14px rgba(0,0,0,0.2)',
                  clipPath: 'inset(0 0 -14px 0)',
                }),
            }}>
            <TaskDetails loading={isLoading} task={task} />
          </Box>
        </Box>
      </Drawer>
      <Confirm
        open={isDeleteDialogOpen}
        onConfirm={() => {
          if (taskId)
            deleteTask(taskId, {
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
          setMode(undefined);
          setTaskId(undefined);
        }}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete task"
        content={t(`You are about to delete {{taskName}} task.`, {
          taskName: task?.name,
        })}
        secondContent="Are you sure about it?"
      />
    </>
  );
};

export default TaskDetailsDrawer;
