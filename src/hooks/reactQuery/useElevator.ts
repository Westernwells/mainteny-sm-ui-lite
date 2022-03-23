import {useCallback} from 'react';
import {useQuery} from 'react-query';
import * as _ from 'lodash';
import getCenter from 'geolib/es/getCenter';
import {AxiosResponse} from 'axios';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {queryKeys} from 'reactQuery/constants';
import {useNavigate} from 'react-router';

import {Elevator, ElevatorView} from '../../models/elevator';
import {Location, Page, Resource, RestError} from '../../models/misc';
import {MaintainerView} from '../../models/technician';
import {useUserSession} from './useUserSession';

export const fetchElevators = async (query: string, page: Page, id: string) => {
  const response = await axiosClient.get<Resource<ElevatorView>>(
    `/api/serviceCompanies/${id}/elevators`,
    {
      params: {query, ...page},
      paramsSerializer,
    },
  );
  return response.data;
};

export const fetchElevator = async (elevatorId: string) => {
  const response = await axiosClient.get<Elevator>(
    `/api/elevators/${elevatorId}`,
  );
  return response.data;
};

export const fetchElevatorMaintainers = async (elevatorId: string) => {
  const response = await axiosClient.get<MaintainerView[]>(
    `/api/elevators/${elevatorId}/maintainers`,
  );
  return response.data;
};

export const fetchElevatorBreakdownHistory = async (elevatorId: string) => {
  const response: AxiosResponse<Resource<any>> = await axiosClient.post(
    `/api/elevators/${elevatorId}/breakdownHistories`,
    {
      data: {
        breakdownDate: '2022-01-03',
        createdAt: '2022-01-03T16:22:56.410Z',
        durationInMinutes: 0,
        serviceOrderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        status: 'REPORTED',
      },
    },
  );
  return response.data;
};

const filterByStatus = (
  elevatorRes: Resource<ElevatorView>,
  status: string[],
) => {
  let filterResult = [] as ElevatorView[];
  const elevatorStatusMap = _.groupBy(
    elevatorRes.data,
    (elevator) => elevator.status,
  );
  status
    .map((item) => elevatorStatusMap[item])
    .filter((item) => item)
    .forEach((item) => {
      filterResult = [...filterResult, ...item];
    });

  return filterResult;
};

const filterElevator = (
  elevatorRes: Resource<ElevatorView>,
  filter: {status: string[]},
) => {
  let result = {...elevatorRes};

  if (filter.status.length) {
    const statusFilter = filterByStatus(elevatorRes, filter.status);
    result = {...result, data: statusFilter, total: statusFilter.length};
  }
  return result;
};

export const useElevatorById = (elevatorId?: string) => {
  const navigate = useNavigate();
  return useQuery(
    [queryKeys.elevatorById, elevatorId],
    () => fetchElevator(elevatorId!),
    {
      enabled: !!elevatorId,
      onError: (e: any) => {
        if (e.response.status === 500) navigate('/404');
      },
    },
  );
};

export const useElevatorMaintainers = (elevatorId?: string) =>
  useQuery(
    [queryKeys.maintainerByElevatorId, elevatorId],
    () => fetchElevatorMaintainers(elevatorId!),
    {
      enabled: !!elevatorId,
    },
  );

export function useAllElevators(
  query: string,
  page: Page,
  filter: {status: string[]},
) {
  const {user} = useUserSession();
  return useQuery<
    Resource<ElevatorView>,
    RestError,
    {elevator: Resource<ElevatorView>; centerCoord: Location}
  >(
    [
      queryKeys.fetchAllElevators,
      query,
      page,
      user?.userAccount.serviceCompany.id,
    ],
    () => fetchElevators(query, page, user!.userAccount.serviceCompany.id),
    {
      enabled: !!user,
      select: useCallback(
        (elevatorResponse: Resource<ElevatorView>) => {
          let result = elevatorResponse;
          result = filterElevator(elevatorResponse, filter);
          const latLng = result?.data.map((elevator: ElevatorView) => ({
            latitude: elevator.address.location.latitude,
            longitude: elevator.address.location.longitude,
          }));
          const centerCoord = getCenter(latLng) as unknown as Location;

          return {
            elevator: result,
            centerCoord,
          };
        },
        [filter, user, query, page],
      ),
    },
  );
}
