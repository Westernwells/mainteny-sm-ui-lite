import {useSnackbar} from 'hooks/useSnackbar';
import {
  CreateEmailSignatureRecord,
  EmailSignature,
  EmployeeStatusView,
  EmployeesView,
  QueryEmployeesParams,
  QueryServiceCompanyEmployeeStatusParams,
  WorkingEmployeesSummary,
  WorkingEmployeeSummaryRequest,
} from 'models/employee';
import {Resource, StringValue} from 'models/misc';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import {queryKeys as qks} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useUserSession} from './useUserSession';
import {useGetUserAccount} from './useUserAccount';

export const queryServiceCompanyEmployees = async (
  serviceCompanyId: string,
  params: QueryEmployeesParams,
) => {
  const response = await axiosClient.get<Resource<EmployeesView>>(
    `/api/serviceCompanies/${serviceCompanyId}/employees`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useQueryServiceCompanyEmployees = (
  params: QueryEmployeesParams,
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;
  return useQuery<Resource<EmployeesView>>(
    [qks.queryServiceCompanyEmployees, serviceCompanyId, params],
    () => queryServiceCompanyEmployees(serviceCompanyId!, params),
    {
      enabled: !!user,
      ...options,
    },
  );
};

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

export const getWorkingEmployeeSummary = async (
  serviceCompanyId: string,
  params: WorkingEmployeeSummaryRequest,
) => {
  const response = await axiosClient.get<WorkingEmployeesSummary>(
    `/api/serviceCompanies/${serviceCompanyId}/workSummary`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useWorkingEmployeeSummary = (
  params: WorkingEmployeeSummaryRequest,
): UseQueryResult<WorkingEmployeesSummary> => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  return useQuery<WorkingEmployeesSummary>(
    [qks.getWorkingTechnicians, serviceCompanyId, params],
    () => getWorkingEmployeeSummary(serviceCompanyId!, params),
    {
      enabled: !!user,
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
      showError(err);
    },
  });
};

export const queryEmployeeSignature = async (employeeId: string) => {
  const response = await axiosClient.get<EmailSignature[]>(
    `/api/employees/${employeeId}/emailSignatures`,
  );
  return response.data;
};

export const useQueryEmployeeSignature = (
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  const {data: userAccount} = useGetUserAccount(user?.userAccount.id);
  const employeeId = userAccount?.userData.employeeId!;
  return useQuery<EmailSignature[]>(
    [qks.fetchEmployeeEmailSignatures, employeeId],
    () => queryEmployeeSignature(employeeId!),
    {
      enabled: !!user && !!employeeId,
      ...options,
    },
  );
};

export const postEmployeeEmailSignature = async (
  employeeId: string,
  body: CreateEmailSignatureRecord,
) => {
  await axiosClient.post(`api/employees/${employeeId}/emailSignatures`, body);
};

export const usePostEmployeeEmailSignature = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({
      employeeId,
      body,
    }: {
      employeeId: string;
      body: CreateEmailSignatureRecord;
    }) => postEmployeeEmailSignature(employeeId, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qks.fetchEmployeeEmailSignatures]);
        enqueueSnackbar(`Email signature created successfully`, {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const putEmployeeEmailSignature = async (
  body: CreateEmailSignatureRecord,
  employeeId: string,
  signatureId: string,
) => {
  const {data} = await axiosClient.put<StringValue>(
    `api/employees/${employeeId}/emailSignatures/${signatureId}`,
    body,
  );
  return data;
};

export const useUpdateEmployeeEmailSignature = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({
      data,
      employeeId,
      signatureId,
    }: {
      data: CreateEmailSignatureRecord;
      employeeId: string;
      signatureId: string;
    }) => putEmployeeEmailSignature(data, employeeId, signatureId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qks.fetchEmployeeEmailSignatures]);
        queryClient.invalidateQueries([qks.fetchEmployeeEmailSignatureById]);
        enqueueSnackbar(`Email Signature updated successfully`, {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const deleteEmployeeEmailSignature = async (
  employeeId: string,
  signatureId: string,
) => {
  await axiosClient.delete(
    `api/employees/${employeeId}/emailSignatures/${signatureId}`,
  );
};

export const useDeleteEmployeeEmailSignature = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({employeeId, signatureId}: {employeeId: string; signatureId: string}) =>
      deleteEmployeeEmailSignature(employeeId, signatureId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qks.fetchEmployeeEmailSignatures]);
        queryClient.invalidateQueries([qks.fetchEmployeeEmailSignatureById]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};
