import {WorkHourOrderField, WorkHoursItem} from 'models/workHours';
import {useQuery} from 'react-query';
import {queryKeys} from 'reactQuery/constants';

import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {toRestDateTime} from 'utils/datetime';
import {UserActivityView} from 'models/user';
import {Resource, RestError} from '../../models/misc';
import {Order, Page} from '../../models/pagination';

export const getWorkHours = async (
  query: string,
  page: Page,
  startDate: Date,
  endDate: Date,
  employeeId: string,
  order: Order,
  orderByField: WorkHourOrderField,
) => {
  const response = await axiosClient.get<Resource<WorkHoursItem>>(
    `/api/users/${employeeId}/timeLogs`,
    {
      params: {
        query,
        start: toRestDateTime(startDate),
        end: toRestDateTime(endDate),
        order,
        orderByField,
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
  order: Order,
  orderByField: WorkHourOrderField,
) {
  return useQuery<Resource<WorkHoursItem>, RestError>(
    [
      queryKeys.fetchWorkHours,
      query,
      page,
      startDate,
      endDate,
      employeeId,
      order,
      orderByField,
    ],
    () =>
      getWorkHours(
        query,
        page,
        startDate,
        endDate,
        employeeId!,
        order,
        orderByField,
      ),
  );
}

export const getWorkHoursActivities = async (
  query: string,
  page: Page,
  startDate: Date,
  endDate: Date,
  employeeId: string,
) => {
  const response = await axiosClient.get<Resource<UserActivityView>>(
    `/api/users/${employeeId}/activities`,
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

export function useWorkHoursActivities(
  query: string,
  page: Page,
  startDate: Date,
  endDate: Date,
  employeeId: string,
) {
  return useQuery<Resource<UserActivityView>, RestError>(
    [queryKeys.fetchWorkHours, query, page, startDate, endDate, employeeId],
    () => getWorkHoursActivities(query, page, startDate, endDate, employeeId!),
  );
}
