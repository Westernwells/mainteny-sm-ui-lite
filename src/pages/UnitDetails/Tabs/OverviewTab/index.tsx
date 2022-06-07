// import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import useTheme from '@mui/material/styles/useTheme';
import Grid from '@mui/material/Grid';
import {useEffect, useState} from 'react';
// import {createEmptyResource} from 'utils/paging-utils';
// import {endOfYear, startOfYear} from 'date-fns';
import {useLocation} from 'react-router-dom';
// import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {useUseQueryElevatorsContracts} from 'hooks/reactQuery/useContract';
import {ContractStatus, ContractView} from 'models/contract';
import {useElevatorById} from 'hooks/reactQuery/useElevator';
import {ElevatorRequestBody} from 'models/elevator';
import {Progress} from 'components/Progress';
import {Location} from './Location';
import {UnitDetails} from './UnitDetails';
import {Service} from './Service';
import {AppointmentPreference} from './AppointmentPreference';
import {UnitContracts} from './UnitContracts';
import {PriorityTechnician} from './PriorityTechnician';
import {Notes} from './Notes';
import {Pictures} from './Pictures';
import {Documents} from './Documents';

interface Props {
  getUnitName?: (value: string) => void;
}

// const pageSize = 10;

export const OverviewTab = ({getUnitName}: Props) => {
  const elevatorId = (useLocation().state as any).id;
  const theme = useTheme();

  const [validContract, setValidContract] = useState<ContractView>();
  const [elevatorRequestBody, setElevatorRequestBody] =
    useState<Partial<ElevatorRequestBody>>();

  const {data: elevator, isLoading: isLoadingElevator} =
    useElevatorById(elevatorId);
  const {data: contracts = {}, isLoading: isLoadingContract} =
    useUseQueryElevatorsContracts({
      elevatorIds: elevatorId ? [elevatorId] : [],
      status: [
        ContractStatus.VALID,
        ContractStatus.PENDING,
        ContractStatus.EXPIRED,
      ],
    });

  // const {
  //   data: serviceOrders = createEmptyResource<ServiceOrderView>(pageSize),
  // } = useServiceOrders({
  //   elevatorIds: elevatorId ? [elevatorId] : undefined,
  //   start: startOfYear(new Date()).toISOString(),
  //   end: endOfYear(new Date()).toISOString(),
  //   pageSize,
  //   pageIndex: 0,
  //   query: '',
  //   status: [
  //     ServiceOrderStatus.SCHEDULED,
  //     ServiceOrderStatus.COMPLETED,
  //     ServiceOrderStatus.IN_PROGRESS,
  //   ],
  // });

  // console.log(serviceOrders, '____----');

  useEffect(() => {
    if (getUnitName && elevator) {
      getUnitName(elevator.model);
    }
  }, [elevator]);

  useEffect(() => {
    if (Object.keys(contracts).length) {
      const result = contracts[elevatorId!].filter(
        (item) => item.status === ContractStatus.VALID,
      );
      setValidContract(result[0]);
    }
  }, [contracts]);

  useEffect(() => {
    if (elevator) {
      let properties = {};
      elevator.properties.forEach((item) => {
        properties = {
          ...properties,
          [item.key]: item.value,
        };
      });
      const body = {
        address: elevator.address,
        buildingLocation: elevator.additionalInfo.buildingLocation,
        builtYear: elevator.additionalInfo.builtYear,
        cabinType: elevator.additionalInfo.cabinType,
        capacity: elevator.capacity,
        category: elevator.category,
        controllerManufacturer: elevator.additionalInfo.controllerManufacturer,
        controllerModel: elevator.additionalInfo.controllerModel,
        documents: elevator.additionalInfo.documents,
        emergencyContractNumber:
          elevator.additionalInfo.emergencyContractNumber,
        emergencyPhoneProvider: elevator.additionalInfo.emergencyPhoneProvider,
        keyLocation: elevator.additionalInfo.keyLocation,
        lastInspectionDate: elevator.additionalInfo.lastInspectionDate,
        lastVisitDate: elevator.lastVisitDate,
        manufacturer: elevator.additionalInfo.manufacturer,
        model: elevator.model,
        number: elevator.number,
        numberOfStops: elevator.additionalInfo.numberOfStops,
        parking: elevator.additionalInfo.parking,
        pictures: elevator.additionalInfo.pictures,
        priority: elevator.additionalInfo.priority,
        properties,
        // propertyManagerId: elevator.propertyManager?.id || '',
        propertyOwnerId: elevator.propertyOwner.id,
        propertySegment: elevator.additionalInfo.propertySegment,
        qrCode: elevator.additionalInfo.qrCode,
        serialNumber: elevator.serialNumber,
        serviceTime: elevator.serviceTime,
        status: elevator.status,
        technicianNumber: elevator.technicianNumber,
        type: elevator.type,
      };
      setElevatorRequestBody(body);
    }
  }, [elevator]);

  if (isLoadingElevator || isLoadingContract) {
    return <Progress />;
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid item md={5} sm={12}>
          <Location
            elevatorRequestBody={elevatorRequestBody}
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
            validContract={validContract}
            elevatorRequestBody={elevatorRequestBody}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{mt: '0.3em'}}>
        <Grid item md={5} sm={12}>
          <Service
            containerStyles={{
              [theme.breakpoints.up('md')]: {
                minHeight: '23rem',
              },
            }}
            elevator={elevator!}
            validContract={validContract}
            elevatorRequestBody={elevatorRequestBody}
          />
        </Grid>
        <Grid item md={7} sm={12}>
          <AppointmentPreference
            containerStyles={{
              [theme.breakpoints.up('md')]: {
                minHeight: '23rem',
              },
            }}
            elevator={elevator!}
            elevatorRequestBody={elevatorRequestBody}
          />
        </Grid>
      </Grid>

      <UnitContracts
        contracts={elevatorId ? contracts[elevatorId] || [] : []}
        containerStyles={{mt: '1.2em'}}
      />

      <PriorityTechnician
        containerStyles={{mt: '1.2em'}}
        elevatorId={elevator?.id}
      />

      <Grid
        container
        spacing={2}
        sx={{
          mt: '0.3em',
          [theme.breakpoints.up('md')]: {
            maxHeight: 500,
          },
        }}>
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            [theme.breakpoints.up('md')]: {
              height: '100%',
            },
          }}>
          <Notes elevatorId={elevator?.id} />
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          sx={{
            [theme.breakpoints.up('md')]: {
              height: '100%',
            },
          }}>
          <Pictures
            elevator={elevator!}
            elevatorRequestBody={elevatorRequestBody}
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={4}
          sx={{
            [theme.breakpoints.up('md')]: {
              height: '100%',
            },
          }}>
          <Documents
            elevator={elevator!}
            elevatorRequestBody={elevatorRequestBody}
          />
        </Grid>
      </Grid>
    </>
  );
};
