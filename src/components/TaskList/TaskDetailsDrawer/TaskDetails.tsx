import {Typography} from '@mui/material';
import {Box} from '@mui/system';
import {
  TASK_STATUS_ICON_COLOR,
  TaskAssignmentType,
  TaskRefEntityType,
  taskRefEntityTypeToLabel,
  TaskStatus,
  TaskView,
} from 'models/tasks';
import {useTranslation} from 'react-i18next';
import {theme} from 'theme';
import RadarOutlinedIcon from '@mui/icons-material/RadarOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import {Avatar} from 'components/Avatar';
import {convertUserAccountSimpleViewToAvatar} from 'utils/account-utils';
import {Link} from 'react-router-dom';
import StatusPicker, {StatusPickerOption} from 'components/StatusPicker';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import {useEditTask} from 'hooks/reactQuery/useTasks';
import {Progress} from 'components/Progress';
import {formatDate} from 'utils/datetime';
import TagCell from 'components/Tag/TagCell';
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import DOMPurify from 'dompurify';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import {SvgIconComponent} from '@mui/icons-material';

interface Props {
  task?: TaskView;
  loading?: boolean;
}

const TASK_STATUSES_OPTIONS: StatusPickerOption[] = [
  {
    label: 'To-do',
    value: TaskStatus.TO_DO,
    icon: (
      <RuleOutlinedIcon
        htmlColor={TASK_STATUS_ICON_COLOR[TaskStatus.TO_DO].background}
        sx={{width: '20px', height: '20px'}}
      />
    ),
    backgroundColor: TASK_STATUS_ICON_COLOR[TaskStatus.TO_DO].background,
    textColor: TASK_STATUS_ICON_COLOR[TaskStatus.TO_DO].text,
  },
  {
    label: 'Ongoing',
    value: TaskStatus.IN_PROGRESS,
    icon: (
      <RefreshOutlinedIcon
        htmlColor={TASK_STATUS_ICON_COLOR[TaskStatus.IN_PROGRESS].background}
        sx={{width: '20px', height: '20px'}}
      />
    ),
    backgroundColor: TASK_STATUS_ICON_COLOR[TaskStatus.IN_PROGRESS].background,
    textColor: TASK_STATUS_ICON_COLOR[TaskStatus.IN_PROGRESS].text,
  },
  {
    label: 'Paused',
    value: TaskStatus.PAUSED,
    icon: (
      <PauseOutlinedIcon
        htmlColor={TASK_STATUS_ICON_COLOR[TaskStatus.PAUSED].background}
        sx={{width: '20px', height: '20px'}}
      />
    ),
    backgroundColor: TASK_STATUS_ICON_COLOR[TaskStatus.PAUSED].background,
    textColor: TASK_STATUS_ICON_COLOR[TaskStatus.PAUSED].text,
  },
  {
    label: 'Done',
    value: TaskStatus.DONE,
    icon: (
      <CheckCircleOutlineOutlinedIcon
        htmlColor={TASK_STATUS_ICON_COLOR[TaskStatus.DONE].background}
        sx={{width: '20px', height: '20px'}}
      />
    ),
    backgroundColor: TASK_STATUS_ICON_COLOR[TaskStatus.DONE].background,
    textColor: TASK_STATUS_ICON_COLOR[TaskStatus.DONE].text,
  },
  {
    label: 'Archive',
    value: TaskStatus.ARCHIVED,
    icon: (
      <Inventory2OutlinedIcon
        htmlColor={TASK_STATUS_ICON_COLOR[TaskStatus.ARCHIVED].background}
        sx={{width: '20px', height: '20px'}}
      />
    ),
    backgroundColor: TASK_STATUS_ICON_COLOR[TaskStatus.ARCHIVED].background,
    textColor: TASK_STATUS_ICON_COLOR[TaskStatus.ARCHIVED].text,
  },
];

const TaskDetails = ({task, loading = false}: Props) => {
  const {t} = useTranslation();
  const {mutateAsync: editTask} = useEditTask(task?.id);

  const isRefEntityPresent =
    !!task?.refEntity && !!task.refEntityId && !!task.refEntityType;

  const renderRefEntity = () => {
    const refEntityType = task?.refEntityType!;
    const refEntityId = task?.refEntityId!;

    return (
      <Box columnGap={0.5} display="flex" flexDirection="row">
        <Typography>{t(taskRefEntityTypeToLabel[refEntityType])}</Typography>
        <Typography
          component={Link}
          to={
            refEntityType === TaskRefEntityType.ELEVATOR
              ? `/units/details/${refEntityId}`
              : `/orders/details/${refEntityId}`
          }
          sx={{cursor: 'pointer', textDecoration: 'none'}}
          color={theme.palette.primary.light}>
          {task?.refEntity?.externalId}
        </Typography>
      </Box>
    );
  };

  const renderAssignedToLabel = () => {
    if (task?.assignedEmployee) {
      return (
        <Avatar
          key={`task-avatar-${task?.assignedEmployee?.id}`}
          userAccount={convertUserAccountSimpleViewToAvatar(
            task?.assignedEmployee?.userAccount,
          )}
        />
      );
    }

    const assignmentTypeMap: Record<
      string,
      {icon: SvgIconComponent; labelKey: string}
    > = {
      [TaskAssignmentType.OFFICE]: {
        icon: BusinessOutlinedIcon,
        labelKey: 'Office',
      },
      [TaskAssignmentType.TECHNICIANS]: {
        icon: BuildOutlinedIcon,
        labelKey: 'Technicians',
      },
    };

    const config = task?.assignmentType
      ? assignmentTypeMap[task.assignmentType]
      : undefined;

    if (config) {
      const {icon: Icon} = config;
      return (
        <Box
          columnGap={1}
          display="flex"
          flexDirection="row"
          alignItems="center">
          <Icon sx={{width: '20px', height: '20px'}} />
          <Typography mt="5px">{t(config.labelKey)}</Typography>
        </Box>
      );
    }

    return '-';
  };

  const renderView = () => {
    if (loading) return <Progress />;

    return (
      <Box width="100%">
        <Box
          py={1.8}
          px={1.5}
          width="100%"
          rowGap={2}
          display="flex"
          flexDirection="column"
          sx={{backgroundColor: theme.palette.inputBackground.main}}>
          <Box
            width="100%"
            alignItems="center"
            display="flex"
            flexDirection="row">
            <Box columnGap={1} flex={1} display="flex" flexDirection="row">
              <RadarOutlinedIcon htmlColor={theme.palette.text.secondary} />
              <Typography color={theme.palette.text.secondary}>
                {t('Status')}
              </Typography>
            </Box>
            <Box display="flex" flex={1}>
              <StatusPicker
                testId="task-status-picker"
                value={task?.status}
                onChange={(newStatus) => {
                  editTask({status: newStatus.value as TaskStatus});
                }}
                options={TASK_STATUSES_OPTIONS}
              />
            </Box>
          </Box>
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            flexDirection="row">
            <Box columnGap={1} flex={1} display="flex" flexDirection="row">
              <CalendarTodayOutlinedIcon
                htmlColor={theme.palette.text.secondary}
              />
              <Typography color={theme.palette.text.secondary}>
                {t('Due date')}
              </Typography>
            </Box>
            <Box flex={1}>
              <Typography>
                {!task?.dueDate ? '-' : formatDate(task?.dueDate)}
              </Typography>
            </Box>
          </Box>
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            flexDirection="row">
            <Box columnGap={1} flex={1} display="flex" flexDirection="row">
              <PersonOutlineOutlinedIcon
                htmlColor={theme.palette.text.secondary}
              />
              <Typography color={theme.palette.text.secondary}>
                {t('Assigned to')}
              </Typography>
            </Box>
            <Box flex={1}>{renderAssignedToLabel()}</Box>
          </Box>
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            flexDirection="row">
            <Box columnGap={1} flex={1} display="flex" flexDirection="row">
              <LabelOutlinedIcon htmlColor={theme.palette.text.secondary} />
              <Typography color={theme.palette.text.secondary}>
                {t('Tags')}
              </Typography>
            </Box>
            <Box flex={1}>
              <TagCell disabled tags={task?.additionalInfo.tags || []} />
            </Box>
          </Box>
          <Box
            width="100%"
            display="flex"
            alignItems="center"
            flexDirection="row">
            <Box columnGap={1} flex={1} display="flex" flexDirection="row">
              <LinkOutlinedIcon htmlColor={theme.palette.text.secondary} />
              <Typography color={theme.palette.text.secondary}>
                {t('Connected to')}
              </Typography>
            </Box>
            <Box flex={1}>
              {isRefEntityPresent ? (
                renderRefEntity()
              ) : (
                <Typography>-</Typography>
              )}
            </Box>
          </Box>
        </Box>
        <Box mt={2}>
          <Box display="flex" flexDirection="row" alignItems="center">
            <TextSnippetOutlinedIcon
              sx={{width: '20px', height: '20px'}}
              htmlColor={theme.palette.text.secondary}
            />
            <Typography
              ml={1}
              mt="3px"
              color={theme.palette.text.secondary}
              variant="subtitle1">
              {t('Description')}
            </Typography>
          </Box>
          {task?.description ? (
            <Typography
              variant="inherit"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(task?.description!),
              }}
            />
          ) : (
            '-'
          )}
        </Box>
      </Box>
    );
  };

  return <Box width="100%">{renderView()}</Box>;
};

export default TaskDetails;
