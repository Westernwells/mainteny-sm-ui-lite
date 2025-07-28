import TaskList from 'components/TaskList';
import {TaskRefEntityType} from 'models/tasks';

type Props = {
  elevatorId: string;
};

const TasksTab = ({elevatorId}: Props) => (
  <TaskList
    refEntity={{
      refType: TaskRefEntityType.ELEVATOR,
      refId: elevatorId,
    }}
    paginationSx={{marginTop: 2}}
    quickFilterContainerSx={{my: 2}}
  />
);

export default TasksTab;
