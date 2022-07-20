import {
  EmployeeStatusView,
  EmployeesView,
  QueryServiceCompanyEmployeeStatusParams,
} from 'models/employee';
import {Resource} from 'models/misc';
import {useQuery, UseQueryOptions} from 'react-query';
import {queryKeys as qks} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useUserSession} from './useUserSession';

export const getEmployee = async (employeeId: string) => {
  const response = await axiosClient.get<EmployeesView[]>(
    `/api/users/technicians`,
    {
      params: {employeeId},
      paramsSerializer,
    },
  );
  return response.data;
};

export const useGetEmployee = (employeeId: string | null) =>
  useQuery([qks.getTechnician, employeeId], () => getEmployee(employeeId!), {
    enabled: !!employeeId,
  });

export const queryServiceCompanyEmployeeStatus = async (
  serviceCompanyId: string,
  params: QueryServiceCompanyEmployeeStatusParams,
) => {
  const response = await axiosClient.get<Resource<EmployeeStatusView>>(
    `/api/serviceCompanies/${serviceCompanyId}/employeeStatus`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useQueryServiceCompanyEmployeeStatus = (
  params: QueryServiceCompanyEmployeeStatusParams,
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  return useQuery<Resource<EmployeeStatusView>>(
    [qks.queryServiceCompanyEmployeeStatus, serviceCompanyId, params],
    () => queryServiceCompanyEmployeeStatus(serviceCompanyId!, params),
    {
      enabled: !!user,
      ...options,
    },
  );
};
