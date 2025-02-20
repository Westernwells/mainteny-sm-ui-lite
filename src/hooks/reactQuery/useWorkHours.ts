import {
  WorkHourActivitiesOrderField,
  WorkHourOrderField,
  WorkHoursItem,
} from 'models/workHours';
import {useQuery} from 'react-query';
import {queryKeys} from 'reactQuery/constants';

import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {toRestDateTime} from 'utils/datetime';
import {UserActivityStatistics, UserActivityView} from 'models/user';
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
  order?: Order,
  orderByField?: WorkHourActivitiesOrderField,
) => {
  const response = await axiosClient.get<Resource<UserActivityView>>(
    `/api/users/${employeeId}/activities`,
    {
      params: {
        query,
        start: toRestDateTime(startDate),
        end: toRestDateTime(endDate),
        ...(order && {order}),
        ...(orderByField && {orderByField}),
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
  order?: Order,
  orderByField?: WorkHourActivitiesOrderField,
) {
  return useQuery<Resource<UserActivityView>, RestError>(
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
      getWorkHoursActivities(
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

export const getWorkHoursActivityStatistics = async (payload: {
  query: string;
  startDate: Date;
  endDate: Date;
  employeeId: string;
}) => {
  const {employeeId, startDate, endDate, query} = payload;

  const response = await axiosClient.get<UserActivityStatistics>(
    `/api/users/${employeeId}/activity/statistics`,
    {
      params: {
        query,
        start: toRestDateTime(startDate),
        end: toRestDateTime(endDate),
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export function useWorkHoursActivityStatistics(payload: {
  query: string;
  startDate: Date;
  endDate: Date;
  employeeId: string;
}) {
  const {query, startDate, endDate, employeeId} = payload;

  return useQuery<UserActivityStatistics, RestError>(
    [queryKeys.fetchWorkHours, query, startDate, endDate, employeeId],
    () => getWorkHoursActivityStatistics(payload),
  );
}
