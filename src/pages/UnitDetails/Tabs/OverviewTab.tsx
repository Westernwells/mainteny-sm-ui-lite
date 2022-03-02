import {
  Elevator,
  ElevatorMaintenanceHistoryView as ServiceHistoryView,
} from 'models/elevator';
import {
  ServiceOrderOrderField,
  ServiceOrderType,
  ServiceOrderView,
} from 'models/service-order';
import useTheme from '@mui/material/styles/useTheme';
import {Order} from 'models/misc';
import Grid from '@mui/material/Grid';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
// import {useIssueHistory} from 'hooks/reactQuery/useIssueHistory';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {endOfMonth, endOfYear, startOfDay, startOfYear} from 'date-fns';
import {toRestDateTime} from 'utils/datetime';
import {useParams} from 'react-router-dom';
import {ReactComponent as Escalator} from 'assets/icons/Escalator.svg';
import {PageCard} from 'components/PageCard';
import {
  user,
  issueHistory,
  serviceHistories,
  runningServiceOrders,
} from './dummyData';
// import {useServiceHistory} from 'hooks/reactQuery/useServiceHistory';
// import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';
// import {usePropertyManager} from 'hooks/reactQuery/usePropertyManager';
import {ElevatorAvailabilitySection} from '../ElevatorAvailabilitySection';
import {ElevatorBasicSection} from '../ElevatorBasicSection';
import {TechnicianSection} from '../TechnicianSection';
import {MaintainerView} from '../../../models/technician';
import {ServiceHistory} from '../ServiceHistory';

const pageSize = 10;

interface Props {
  // TODO: Resolve 'any' type here
  elevator?: Elevator | any;
  // TODO: Resolve 'any' type here
  maintainers: MaintainerView[] | any;
}

export const OverviewTab = ({elevator, maintainers}: Props) => {
  const {id: elevatorId} = useParams();
  const theme = useTheme();
  // TODO: user reactQuery hooks to fetch data
  // const {data: user} = usePropertyManager();
  // const {data: issueHistory = createEmptyResource<ServiceOrderView>(pageSize)} =
  //   useIssueHistory({
  //     elevatorIds: elevatorId,
  //     start: startOfYear(new Date()).toISOString(),
  //     end: endOfYear(new Date()).toISOString(),
  //     pageSize,
  //     pageIndex: 0,
  //     serviceCompanyId: user?.userAccount.serviceCompany.id,
  //     query: '',
  //     types: [
  //       ServiceOrderType.CALLOUT,
  //       ServiceOrderType.EMERGENCY,
  //       ServiceOrderType.REPAIR,
  //     ],
  //     status: [],
  //     orderBy: ServiceOrderOrderField.CREATED_TIME,
  //     order: Order.DESC,
  //   });

  // const {
  //   data: serviceHistories = createEmptyResource<ServiceHistoryView>(pageSize),
  // } = useServiceHistory(makePage(0, 10), elevatorId);

  // const {
  //   data: runningServiceOrders = createEmptyResource<ServiceOrderView>(
  //     pageSize,
  //   ),
  // } = useServiceOrders({
  //   elevatorIds: elevatorId,
  //   start: toRestDateTime(startOfDay(new Date())),
  //   end: toRestDateTime(endOfMonth(new Date())),
  //   pageSize: 2,
  //   pageIndex: 0,
  //   query: '',
  // });
  return (
    <>
      <Grid container spacing={2} sx={{mt: '1em'}}>
        <Grid item xs={4}>
          <ElevatorBasicSection
            elevator={elevator}
            serviceOrder={runningServiceOrders.data[0]}
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
        <Grid item xs={3} zeroMinWidth>
          <TechnicianSection maintainers={maintainers} />
        </Grid>
        <Grid item xs={5}>
          <ElevatorAvailabilitySection />
        </Grid>
      </Grid>

      <Grid container sx={{mt: '1em'}}>
        <Grid item xs={12}>
          <PageCard contentPadding="1.5em" headerLabel="Service History">
            <ServiceHistory
              bodyContainerStyle={{
                borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              }}
            />
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
              <ServiceHistory
                bodyContainerStyle={{
                  borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                }}
              />
            ))}
          </PageCard>
        </Grid>
      </Grid>
    </>
  );
};
