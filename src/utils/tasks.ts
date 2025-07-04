import {
  TaskAssignmentType,
  TaskQuickFilter,
  TaskStatus,
  TaskTableRow,
  TaskView,
} from 'models/tasks';
import {UserView} from 'models/user';

export const getTaskStatusStyles = (
  status: TaskStatus,
): {
  label: string;
  color:
    | 'darkSuccess'
    | 'warning'
    | 'error'
    | 'default'
    | 'primary'
    | 'action.active'
    | '#8F9BB326';
} => {
  switch (status) {
    case TaskStatus.TO_DO:
      return {label: 'To-do', color: '#8F9BB326'};
    case TaskStatus.IN_PROGRESS:
      return {label: 'Ongoing', color: 'primary'};
    case TaskStatus.DONE:
      return {label: 'Done', color: 'darkSuccess'};
    case TaskStatus.PAUSED:
      return {label: 'Paused', color: 'warning'};
    case TaskStatus.OVERDUE:
      return {label: 'Overdue', color: 'error'};
    case TaskStatus.ARCHIVED:
      return {label: 'Archived', color: 'action.active'};
    case TaskStatus.CANCELLED:
      return {label: 'Cancelled', color: 'action.active'};
    default:
      return {label: '-', color: 'default'};
  }
};

export const aggregateTaskRow = (tasks: TaskView[]): TaskTableRow[] =>
  tasks.map((task) => ({
    data: task,
    id: task.id,
    name: task.name,
    status: task.status,
    description: task.description,
    createdAt: task.meta.createdAt,
    dueDate: task.dueDate,
    assignedEmployee: task.assignedEmployee,
    assignmentType: task.assignmentType,
    creator: task.meta.creator!,
    tags: task.additionalInfo.tags,
    task,
  }));

export const ALL_TASK_STATUSES = Object.values(TaskStatus);
export const ALL_INTERACTIVE_TASK_STATUS = [
  TaskStatus.TO_DO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.PAUSED,
  TaskStatus.DONE,
  TaskStatus.ARCHIVED,
];

export const copyTaskLink = (taskId: string) => {
  const path = `/tasks?mode=view&taskId=${taskId}`;
  const fullUrl = `${window.location.origin}${path}`;
  navigator.clipboard.writeText(fullUrl);
};

export const quickFilterToAssignmentType = (
  quickFilter?: TaskQuickFilter,
): TaskAssignmentType | undefined => {
  if (!quickFilter || quickFilter === TaskQuickFilter.ALL) return undefined;
  if (quickFilter === TaskQuickFilter.OFFICE) return TaskAssignmentType.OFFICE;
  if (quickFilter === TaskQuickFilter.TECHNICIANS)
    return TaskAssignmentType.TECHNICIANS;

  return TaskAssignmentType.SINGLE;
};

export const quickFilterToAssignedEmployeeId = (
  quickFilter?: TaskQuickFilter,
  userAccount?: UserView,
) => {
  if (quickFilter === TaskQuickFilter.My_TASKS && !!userAccount)
    return userAccount.userData.employeeId;

  return undefined;
};
