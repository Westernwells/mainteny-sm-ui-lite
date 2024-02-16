import {XeroIntegrationRecord, XeroIntegrationView} from 'models/integrations';
import {useQuery, useMutation} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';

export const getXeroIntegration = async (serviceCompanyId: string) => {
  const response = await axiosClient.get<XeroIntegrationView>(
    `/api/serviceCompanies/${serviceCompanyId}/settings/xero`,
    {
      params: {serviceCompanyId},
      paramsSerializer,
    },
  );
  return response.data;
};

export const useServiceCompanyXeroSettings = (serviceCompanyId: string) =>
  useQuery(
    queryKeys.fetchXeroIntegration,
    () => getXeroIntegration(serviceCompanyId),
    {
      enabled: !!serviceCompanyId,
    },
  );

export const updateXeroIntegration = async (
  serviceCompanyId: string,
  data: Omit<XeroIntegrationRecord, 'enabled'>,
) => {
  const response = await axiosClient.put(
    `/api/serviceCompanies/${serviceCompanyId}/settings/xero`,
    data,
    {
      params: {serviceCompanyId},
      paramsSerializer,
    },
  );
  return response.data;
};

export const useUpdateServiceCompanyXeroSettings = (serviceCompanyId: string) =>
  useMutation((data: Omit<XeroIntegrationRecord, 'enabled'>) =>
    updateXeroIntegration(serviceCompanyId, data),
  );
