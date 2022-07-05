import {useQuery} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient} from 'utils/axios-utils';

const fetchUuid = async () => {
  const {data} = await axiosClient.get('/api/system/uuid');
  return data;
};

export const useUuid = () => useQuery([queryKeys.fetchUuid], () => fetchUuid());
