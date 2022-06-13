import {EmployeesView} from 'models/employee';
import {useQuery} from 'react-query';
import {queryKeys as qks} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';

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
