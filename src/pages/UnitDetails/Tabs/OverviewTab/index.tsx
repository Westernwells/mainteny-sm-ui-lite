import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import useTheme from '@mui/material/styles/useTheme';
import Grid from '@mui/material/Grid';
import {useEffect, useState} from 'react';
import {createEmptyResource} from 'utils/paging-utils';
import {endOfYear, startOfYear} from 'date-fns';
import {useParams} from 'react-router-dom';
import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {useUseQueryElevatorsContracts} from 'hooks/reactQuery/useContract';
import {
  ContractRequestBody,
  ContractStatus,
  ContractView,
} from 'models/contract';
import {
  useElevatorById,
  useElevatorMaintainers,
} from 'hooks/reactQuery/useElevator';
import {ElevatorRequestBody} from 'models/elevator';
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

const pageSize = 10;

export const OverviewTab = ({getUnitName}: Props) => {
  const {id: elevatorId} = useParams();
  const theme = useTheme();

  const [validContract, setValidContract] = useState<ContractView>();
  const [elevatorRequestBody, setElevatorRequestBody] =
    useState<Partial<ElevatorRequestBody>>();
  const [contractRequestBody, setContractRequestBody] =
    useState<Partial<ContractRequestBody>>();

  const {data: elevator, isLoading: isLoadingElevator} =
    useElevatorById(elevatorId);
  const {data: contracts = {}} = useUseQueryElevatorsContracts({
    elevatorIds: elevatorId ? [elevatorId] : [],
    status: [
      ContractStatus.VALID,
      ContractStatus.PENDING,
      ContractStatus.EXPIRED,
    ],
  });

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

  console.log(serviceOrders, '____----');

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

  useEffect(() => {
    const body = {
      currency: validContract?.currency,
      endDate: validContract?.endTime,
      externalId: '',
      hourlyRate: validContract?.hourlyRate,
      price: validContract?.price,
      sla: validContract?.sla,
      spendingLimit: validContract?.spendingLimit,
      startDate: validContract?.startTime,
      timePreference: validContract?.timePreference
        ? validContract.timePreference.map((item) => ({
            fromTime: item.fromTime,
            toTime: item.toTime,
            type: item.type,
          }))
        : [],
      type: validContract?.type,
      visitsNumber: validContract?.visitsNumber,
    };
    setContractRequestBody(body);
  }, [validContract]);

  if (isLoadingElevator) {
    return null;
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
            contractRequestBody={contractRequestBody}
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
          />
        </Grid>
      </Grid>

      <UnitContracts
        contracts={elevatorId ? contracts[elevatorId] || [] : []}
        containerStyles={{mt: '1.2em'}}
      />

      <PriorityTechnician
        containerStyles={{mt: '1.2em'}}
        maintainers={maintainers}
      />

      <Grid container spacing={2} sx={{mt: '0.3em'}}>
        <Grid item md={4}>
          <Notes />
        </Grid>

        <Grid item md={4}>
          <Pictures />
        </Grid>

        <Grid item md={4}>
          <Documents />
        </Grid>
      </Grid>
    </>
  );
};
