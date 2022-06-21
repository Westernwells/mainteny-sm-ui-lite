import {WorkHoursItem} from 'models/workHours';
import {useQuery} from 'react-query';
import {queryKeys} from 'reactQuery/constants';

import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {toRestDateTime} from 'utils/datetime';
import {Page, Resource, RestError} from '../../models/misc';

export const getWorkHours = async (
  query: string,
  page: Page,
  startDate: Date,
  endDate: Date,
  employeeId: string,
) => {
  const response = await axiosClient.get<Resource<WorkHoursItem>>(
    `/api/users/${employeeId}/timeLogs`,
    {
      params: {
        query,
        start: toRestDateTime(startDate),
        end: toRestDateTime(endDate),
        ...page,
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export function useWorkHours(
  query: string,
  page: Page,
  startDate: Date,
  endDate: Date,
  employeeId: string,
) {
  return useQuery<Resource<WorkHoursItem>, RestError>(
    [queryKeys.fetchWorkHours, query, page, startDate, endDate, employeeId],
    () => getWorkHours(query, page, startDate, endDate, employeeId!),
  );
}
