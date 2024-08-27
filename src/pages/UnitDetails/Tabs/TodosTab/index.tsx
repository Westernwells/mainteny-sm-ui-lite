import {useTranslation} from 'react-i18next';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {EmptySection} from 'components/EmptySection';
import {InfoCard} from 'components/InfoCard';
import {Progress} from 'components/Progress';
import {useTodos} from 'hooks/reactQuery/useElevator';
import {ElevatorComment} from 'models/elevator';
import {createEmptyResource} from 'utils/paging';
import {NewTodoForm} from './NewTodoForm';
import {TodoCard} from './TodoCard';

export const TodosTab = () => {
  const {t} = useTranslation();
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
        <InfoCard
          header={<Typography variant="h6">{t('To-Do List')}</Typography>}
          minHeight="100%"
          showHeaderBackground>
          {isFetched && todosResource.data.length === 0 ? (
            <EmptySection
              label="No to-do added yet."
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
        <InfoCard
          header={<Typography variant="subtitle1">{t('New To-Do')}</Typography>}
          minHeight="100%"
          showHeaderBackground>
          <NewTodoForm />
        </InfoCard>
      </Grid>
    </Grid>
  );
};
