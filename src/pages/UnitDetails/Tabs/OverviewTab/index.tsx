/*eslint-disable*/
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import useTheme from '@mui/material/styles/useTheme';
import Grid from '@mui/material/Grid';
import {useEffect} from 'react';
import {createEmptyResource} from 'utils/paging-utils';
import {endOfYear, startOfYear} from 'date-fns';
import {useParams} from 'react-router-dom';
import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {
  useElevatorById,
  useElevatorMaintainers,
} from 'hooks/reactQuery/useElevator';
import {Location} from './Location';
import {UnitDetails} from './UnitDetails';

interface Props {
  getServiceHistoryTabIndex?: (value: number) => void;
  getUnitName?: (value: string) => void;
}

const pageSize = 10;

export const OverviewTab = ({
  getServiceHistoryTabIndex,
  getUnitName,
}: Props) => {
  const {id: elevatorId} = useParams();
  const theme = useTheme();

  const {data: elevator, isLoading: isLoadingElevator} =
    useElevatorById(elevatorId);

  const {data: maintainers = []} = useElevatorMaintainers(elevatorId);

  const {
    data: serviceOrders = createEmptyResource<ServiceOrderView>(pageSize),
  } = useServiceOrders({
    elevatorIds: elevatorId ? [elevatorId] : undefined,
    start: startOfYear(new Date()).toISOString(),
    end: endOfYear(new Date()).toISOString(),
    pageSize,
    pageIndex: 0,
    query: '',
    status: [
      ServiceOrderStatus.SCHEDULED,
      ServiceOrderStatus.COMPLETED,
      ServiceOrderStatus.IN_PROGRESS,
    ],
  });

  useEffect(() => {
    if (getUnitName && elevator) {
      getUnitName(elevator.model);
    }
  }, [elevator]);

  if (isLoadingElevator) {
    return null;
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid item md={5} sm={12}>
          <Location
            containerStyles={{
              [theme.breakpoints.up('md')]: {
                minHeight: '35rem',
              },
            }}
            elevator={elevator!}
          />
        </Grid>
        <Grid item md={7} sm={12}>
          <UnitDetails
            containerStyles={{
              [theme.breakpoints.up('md')]: {
                minHeight: '35rem',
              },
            }}
            elevator={elevator!}
          />
        </Grid>
      </Grid>
    </>
  );
};
