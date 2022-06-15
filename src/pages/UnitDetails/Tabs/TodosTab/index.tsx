import Grid from '@mui/material/Grid';
import {EmptySection} from 'components/EmptySection';
import {InfoCard} from 'components/InfoCard';
import {Progress} from 'components/Progress';
import {useTodos} from 'hooks/reactQuery/useElevator';
import {ElevatorComment} from 'models/elevator';
import {createEmptyResource} from 'utils/paging-utils';
import {NewTodoForm} from './NewTodoForm';
import {TodoCard} from './TodoCard';

export const TodosTab = () => {
  const {
    data: todosResource = createEmptyResource<ElevatorComment>(10),
    isIdle,
    isLoading,
    isFetched,
  } = useTodos({
    pageIndex: 0,
    pageSize: 25,
  });

  if (isIdle || isLoading) {
    return <Progress />;
  }

  return (
    <Grid container gap={1} flexGrow={1}>
      <Grid item xs={8}>
        <InfoCard header="To-Do List" minHeight="100%" showHeaderBackground>
          {isFetched && todosResource.data.length === 0 ? (
            <EmptySection
              label="No To-Do added yet."
              illustration="clipboard"
              size="small"
              containerStyle={{mt: '8em'}}
            />
          ) : (
            todosResource.data.map((item) => (
              <TodoCard todo={item} key={item.id} />
            ))
          )}
        </InfoCard>
      </Grid>
      <Grid item xs>
        <InfoCard header="New To-Do" minHeight="100%" showHeaderBackground>
          <NewTodoForm />
        </InfoCard>
      </Grid>
    </Grid>
  );
};
