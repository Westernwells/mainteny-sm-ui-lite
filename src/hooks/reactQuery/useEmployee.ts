import {useSnackbar} from 'hooks/useSnackbar';
import {
  EmployeeStatusView,
  EmployeesView,
  QueryServiceCompanyEmployeeStatusParams,
} from 'models/employee';
import {Resource, StringValue} from 'models/misc';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
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

const deleteEmployee = async (employeeId: string) => {
  const response = await axiosClient.delete<StringValue>(
    `/api/users/employees/${employeeId}`,
  );
  return response.data;
};

export const useDeleteEmployee = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation((elevatorId: string) => deleteEmployee(elevatorId), {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries(qks.queryUserAccounts);
      }
    },
    onError: (err: any) => {
      console.log(err);
      showError(err);
    },
  });
};
