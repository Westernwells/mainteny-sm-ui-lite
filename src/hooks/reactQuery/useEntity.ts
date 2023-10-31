import {useQuery} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {IdState, IdStateParams} from 'models/misc';

export const fetchEntitiesStates = async (idStateParams: IdStateParams) => {
  const response = await axiosClient.get<IdState[]>(`/api/entities/states`, {
    params: idStateParams,
    paramsSerializer,
  });
  return response.data;
};

export const useEntitiesStates = (idStateParams: IdStateParams) =>
  useQuery([queryKeys.fetchEntitiesStates, idStateParams], () =>
    fetchEntitiesStates(idStateParams),
  );
