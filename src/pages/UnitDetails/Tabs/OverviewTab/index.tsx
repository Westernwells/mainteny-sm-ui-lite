import useTheme from '@mui/material/styles/useTheme';
import Grid from '@mui/material/Grid';
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {ContractStatus, ContractSimpleView} from 'models/contract';
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

export const OverviewTab = ({getUnitName}: Props) => {
  const {id: elevatorId} = useParams();
  const theme = useTheme();

  const [validContract, setValidContract] = useState<ContractSimpleView>();
  const [elevatorRequestBody, setElevatorRequestBody] =
    useState<Partial<ElevatorRequestBody>>();

  const {data: elevator, isLoading: isLoadingElevator} =
    useElevatorById(elevatorId);

  useEffect(() => {
    if (getUnitName && elevator) {
      getUnitName(elevator.model);
    }
  }, [elevator]);

  useEffect(() => {
    if (elevator) {
      const result = elevator.contracts.filter(
        (item) => item.status === ContractStatus.VALID,
      );
      setValidContract(result[0]);
    }
  }, [elevator]);

  useEffect(() => {
    if (elevator) {
      let properties = {};
      if (elevator.properties) {
        elevator.properties.forEach((item) => {
          properties = {
            ...properties,
            [item.key]: item.value,
          };
        });
      }

      const body = {
        address: elevator.address,
        buildingLocation: elevator.additionalInfo.buildingLocation,
        builtYear: elevator.additionalInfo.builtYear,
        cabinType: elevator.additionalInfo.cabinType,
        capacity: elevator.capacity,
        category: elevator.category,
        controllerManufacturer: elevator.additionalInfo.controllerManufacturer,
        controllerModel: elevator.additionalInfo.controllerModel,
        documents: elevator.additionalInfo.documents || [],
        emergencyContractNumber:
          elevator.additionalInfo.emergencyContractNumber,
        emergencyPhoneProvider: elevator.additionalInfo.emergencyPhoneProvider,
        keyLocation: elevator.additionalInfo.keyLocation,
        lastInspectionDate: elevator.additionalInfo.lastInspectionDate,
        lastVisitDate: elevator.lastVisitDate,
        manufacturer: elevator.additionalInfo.manufacturer,
        model: elevator.model,
        number: elevator.number,
        externalId: elevator.externalId,
        numberOfStops: elevator.additionalInfo.numberOfStops,
        parking: elevator.additionalInfo.parking,
        pictures: elevator.additionalInfo.pictures || [],
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

  if (isLoadingElevator) {
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
        contracts={elevatorId ? elevator!.contracts : []}
        containerStyles={{mt: '1.2em'}}
      />

      <PriorityTechnician
        containerStyles={{mt: '1.2em'}}
        elevatorId={elevator?.id}
        maintainers={elevator?.assignments}
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
