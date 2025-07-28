import TaskList from 'components/TaskList';
import {TaskRefEntityType} from 'models/tasks';

type Props = {
  serviceOrderId: string;
};

const Tasks = ({serviceOrderId}: Props) => (
  <TaskList
    refEntity={{
      refType: TaskRefEntityType.SERVICE_ORDER,
      refId: serviceOrderId,
    }}
    paginationSx={{marginTop: 2}}
    quickFilterContainerSx={{my: 2}}
  />
);

export default Tasks;
