import {ServiceOrderType} from 'models/service-order';
import {useCallback} from 'react';
import {useQuery} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {ElevatorMaintenanceHistoryView} from '../../models/elevator';
import {Page, Resource} from '../../models/misc';

export const fetchServiceHistory = async (elevatorId: string, page: Page) => {
  const response = await axiosClient.get<
    Resource<ElevatorMaintenanceHistoryView>
  >(`/api/elevators/${elevatorId}/maintenanceHistories`, {
    params: {...page},
    paramsSerializer,
  });
  return response.data;
};

export const useServiceHistory = (page: Page, elevatorId?: string) =>
  useQuery(
    [queryKeys.fetchElevatorMaintenanceHistory, elevatorId],
    () => fetchServiceHistory(elevatorId!, page),
    {
      enabled: !!elevatorId,
    },
  );
