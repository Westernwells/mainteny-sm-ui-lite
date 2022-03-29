import {endOfDay, startOfDay} from 'date-fns';
import {Resource} from 'models/misc';
import {
  TechnicianEventPair,
  TechnicianEventView,
  TechniciansEventsParams,
  TechnicianView,
} from 'models/technician';
import {Role, UserAccountView} from 'models/user';
import {useQuery} from 'react-query';
import {queryKeys as qks} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {toRestDateTime} from 'utils/datetime';
import {useUserSession} from './useUserSession';

export const fetchTechnicianEvents = async (technicianId: string) => {
  const response = await axiosClient.get<TechnicianEventView>(
    `/api/technicians/${technicianId}/events`,
    {
      params: {
        start: toRestDateTime(startOfDay(new Date())),
        end: toRestDateTime(endOfDay(new Date())),
      },
    },
  );
  return response.data;
};

export const fetchTechnicians = async (usernames: string[]) => {
  const response = await axiosClient.get<TechnicianView[]>(
    `/api/users/technicians`,
    {
      params: {username: usernames},
      paramsSerializer,
    },
  );
  return response.data;
};

export const useFetchTechnicians = (usernames: string[]) =>
  useQuery(
    [qks.fetchTechnicians, usernames],
    () => fetchTechnicians(usernames!),
    {
      enabled: !!usernames && !!usernames.length,
    },
  );

export const useFetchTechniciansByUserAccounts = (users: UserAccountView[]) => {
  const usernames = users
    .map((user) =>
      user.roles.includes(Role.TECHNICIAN) ? user.username : null,
    )
    .filter((x): x is string => !!x);

  return useQuery(
    [qks.fetchTechnicians, usernames],
    () => fetchTechnicians(usernames!),
    {
      enabled: !!usernames.length,
    },
  );
};

export const queryTechnicianEvents = async (
  serviceCompanyId: string,
  params: TechniciansEventsParams,
) => {
  const response = await axiosClient.get<Resource<TechnicianEventPair>>(
    `/api/serviceCompanies/${serviceCompanyId}/technicianEvents`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useQueryTechnicianEvents = (params: TechniciansEventsParams) => {
  const {user} = useUserSession();
  return useQuery(
    [qks.queryTechniciansEvents, params, user?.userAccount.serviceCompany.id],
    () => queryTechnicianEvents(user!.userAccount.serviceCompany.id, params),
    {
      enabled: !!user,
    },
  );
};
