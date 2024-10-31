import {endOfDay, startOfDay} from 'date-fns';
import {
  EmployeesSimpleView,
  EmployeesView,
  QueryServiceCompanyEmployeeStatusParams,
} from 'models/employee';
import {Resource, RestError} from 'models/misc';
import {
  QueryTechniciansParams,
  RecommendTechnicianPayload,
  TechnicianEventPair,
  TechnicianEventView,
  TechniciansEventsParams,
  TechnicianView,
} from 'models/technician';
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

export const fetchTechnicians = async (
  serviceCompanyId: string,
  params: Omit<QueryServiceCompanyEmployeeStatusParams, 'date'>,
) => {
  const response = await axiosClient.get<Resource<EmployeesSimpleView>>(
    `/api/serviceCompanies/${serviceCompanyId}/employees`,
    {
      params: {
        ...params,
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export const useFetchTechnicians = (
  params: Omit<QueryServiceCompanyEmployeeStatusParams, 'date'>,
  options?: any,
) => {
  const {user} = useUserSession();
  return useQuery(
    [qks.fetchTechnicians, params],
    () => fetchTechnicians(user!.userAccount.serviceCompany.id, params),
    {
      enabled: !!user,
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

export const getTechnicianByEmployeeId = async (employeeId: string) => {
  const response = await axiosClient.get<EmployeesView>(
    `/api/technicians/${employeeId}/`,
  );
  return response.data;
};

export const useGetTechniciansByEmployeeId = (employeeId?: string) =>
  useQuery<EmployeesView>(
    [qks.queryServiceCompanyTechnicians, employeeId],
    () => getTechnicianByEmployeeId(employeeId!),
    {
      enabled: !!employeeId,
    },
  );

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
