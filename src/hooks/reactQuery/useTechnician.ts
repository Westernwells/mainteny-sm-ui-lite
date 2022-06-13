import {endOfDay, startOfDay} from 'date-fns';
import {EmployeesView} from 'models/employee';
import {Resource, RestError} from 'models/misc';
import {
  QueryTechniciansParams,
  RecommendTechnicianPayload,
  TechnicianEventPair,
  TechnicianEventView,
  TechniciansEventsParams,
  TechnicianView,
} from 'models/technician';
import {Role, UserAccountView} from 'models/user';
import {useQuery, UseQueryOptions} from 'react-query';
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

export const useFetchTechniciansByUserAccounts = (
  users: UserAccountView[],
  options?: UseQueryOptions<TechnicianView[], RestError, TechnicianView[]>,
) => {
  const usernames = users
    .map((user) =>
      user.roles.includes(Role.TECHNICIAN) ? user.username : null,
    )
    .filter((x): x is string => !!x);

  return useQuery<TechnicianView[], RestError, TechnicianView[]>(
    [qks.fetchTechnicians, usernames],
    () => fetchTechnicians(usernames!),
    {
      enabled: !!usernames.length,
      ...options,
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

export const useQueryTechnicianEvents = (
  params: TechniciansEventsParams,
  options?: UseQueryOptions<
    Resource<TechnicianEventPair>,
    RestError,
    Resource<TechnicianEventPair>
  >,
) => {
  const {user} = useUserSession();
  return useQuery<
    Resource<TechnicianEventPair>,
    RestError,
    Resource<TechnicianEventPair>
  >(
    [qks.queryTechniciansEvents, params, user?.userAccount.serviceCompany.id],
    () => queryTechnicianEvents(user!.userAccount.serviceCompany.id, params),
    {
      enabled: !!user,
      ...options,
    },
  );
};

export const getTechnician = async (id: string) => {
  const response = await axiosClient.get<TechnicianView[]>(
    `/api/technicians/${id}`,
    {
      params: {id},
      paramsSerializer,
    },
  );
  return response.data;
};

export const useGetTechnician = (id?: string) =>
  useQuery([qks.getTechnician, id], () => getTechnician(id!), {
    enabled: !!id,
  });

export const queryServiceCompanyTechnicians = async (
  serviceCompanyId: string,
  params: QueryTechniciansParams,
) => {
  const response = await axiosClient.get<Resource<EmployeesView>>(
    `/api/serviceCompanies/${serviceCompanyId}/technicians`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useQueryServiceCompanyTechnicians = (
  params: QueryTechniciansParams,
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  return useQuery<Resource<EmployeesView>>(
    [qks.queryServiceCompanyTechnicians, serviceCompanyId, params],
    () => queryServiceCompanyTechnicians(serviceCompanyId!, params),
    {
      enabled: !!user,
      ...options,
    },
  );
};

export const fetchDispatchRecommendedTechnician = async (
  params: RecommendTechnicianPayload,
  serviceCompanyId: string,
) => {
  const response = await axiosClient.get<TechnicianView[]>(
    `/api/dispatch/serviceCompanies/${serviceCompanyId}/technicians/recommendation`,
    {params, paramsSerializer},
  );
  return response.data;
};

export const useFetchDispatchRecommendedTechnician = (
  params: RecommendTechnicianPayload,
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user!.userAccount.serviceCompany.id;
  return useQuery<TechnicianView[]>(
    [qks.fetchDispatchRecommendedTechnicians, serviceCompanyId, params],
    () => fetchDispatchRecommendedTechnician(params, serviceCompanyId),
    {enabled: !!serviceCompanyId, ...options},
  );
};

export const fetchRecommendedTechnician = async (
  elevatorId: string,
  params: RecommendTechnicianPayload,
) => {
  const response = await axiosClient.get<EmployeesView[]>(
    `/api/elevators/${elevatorId}/technicianRecommendation`,
    {params, paramsSerializer},
  );
  return response.data;
};

export const useFetchRecommendedTechnician = (
  params: RecommendTechnicianPayload,
  elevatorId?: string,
  options?: UseQueryOptions<any, any, any>,
) =>
  useQuery<EmployeesView[]>(
    [qks.fetchRecommendedTechnicians, elevatorId, params],
    () => fetchRecommendedTechnician(elevatorId!, params),
    {enabled: !!elevatorId, ...options},
  );
