import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import useTheme from '@mui/material/styles/useTheme';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {useEffect} from 'react';
import Box from '@mui/material/Box';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import {createEmptyResource} from 'utils/paging-utils';
import {endOfYear, startOfYear} from 'date-fns';
import {useParams} from 'react-router-dom';
import {ReactComponent as Escalator} from 'assets/icons/Escalator.svg';
import {PageCard} from 'components/PageCard';
import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {EmptySection} from 'components/EmptySection';
import {
  useElevatorById,
  useElevatorMaintainers,
} from 'hooks/reactQuery/useElevator';
import {ElevatorAvailabilitySection} from '../ElevatorAvailabilitySection';
import {ElevatorBasicSection} from '../ElevatorBasicSection';
import {TechnicianSection} from '../TechnicianSection';
import {ServiceHistory} from '../ServiceHistory';

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

  const {data: elevator} = useElevatorById(elevatorId);

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

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6} md={4}>
          <ElevatorBasicSection
            elevator={elevator}
            serviceOrder={serviceOrders.data[0]}
            rows={[
              {
                leftLabel: elevator?.model,
                leftValue: elevator?.address.fullName,
                leftIcon: <Escalator />,
                status: elevator?.status,
              },
              {
                leftLabel: 'Facility Manager',
                leftValue: elevator?.propertyOwner.name,
                leftIcon: (
                  <PersonOutlineOutlinedIcon
                    sx={{
                      width: '1.125rem',
                      color: theme.palette.text.primary,
                    }}
                  />
                ),
                rightLabel: 'Number',
                rightValue: elevator?.number,
                rightIcon: (
                  <PersonOutlineOutlinedIcon
                    sx={{
                      width: '1.125rem',
                      color: theme.palette.text.primary,
                    }}
                  />
                ),
              },
              {
                leftLabel: 'Capacity',
                leftValue: elevator?.capacity,
                leftIcon: (
                  <PersonOutlineOutlinedIcon
                    sx={{
                      width: '1.125rem',
                      color: theme.palette.text.primary,
                    }}
                  />
                ),
                rightLabel: 'Stops',
                rightValue: 10,
                rightIcon: (
                  <PersonOutlineOutlinedIcon
                    sx={{
                      width: '1.125rem',
                      color: theme.palette.text.primary,
                    }}
                  />
                ),
              },
            ]}
          />
        </Grid>
        <Grid item xs={6} md={4} zeroMinWidth>
          <TechnicianSection maintainers={maintainers} />
        </Grid>
        <Grid item xs={12} md={4}>
          <ElevatorAvailabilitySection />
        </Grid>
      </Grid>

      <Grid container sx={{mt: '1em'}}>
        <Grid item xs={12}>
          <PageCard
            contentContainerStyles={{p: '1.5em'}}
            headerContainerOverrideStyles={{backgroundColor: '#fff'}}
            customHeader={
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: theme.palette.text.primary,
                    }}>
                    All Services
                  </Typography>
                </Box>

                <Box
                  sx={{
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    display: serviceOrders.data.length ? 'block' : 'none',
                  }}
                  onClick={() =>
                    getServiceHistoryTabIndex && getServiceHistoryTabIndex(1)
                  }>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: theme.palette.primary.light,
                    }}>
                    View all
                  </Typography>
                </Box>
              </Box>
            }
            minHeight="10rem">
            {!serviceOrders.data.length ? (
              <EmptySection
                label="No service history entries made so far!"
                size="small"
              />
            ) : (
              serviceOrders.data.map((serviceOrder) => (
                <ServiceHistory
                  key={serviceOrder.id}
                  serviceOrder={serviceOrder}
                />
              ))
            )}
          </PageCard>
        </Grid>
      </Grid>
    </>
  );
};
