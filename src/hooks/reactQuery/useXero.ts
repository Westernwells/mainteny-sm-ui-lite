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
  data: XeroIntegrationRecord,
) => {
  const response = await axiosClient.put<XeroIntegrationView>(
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
  useMutation((data: XeroIntegrationRecord) =>
    updateXeroIntegration(serviceCompanyId, data),
  );

export const deleteXeroIntegration = async (serviceCompanyId: string) => {
  const response = await axiosClient.delete(
    `/api/serviceCompanies/${serviceCompanyId}/settings/xero/disconnect`,
    {
      params: {serviceCompanyId},
      paramsSerializer,
    },
  );
  return response.data;
};

export const useDeleteServiceCompanyXeroSettings = (serviceCompanyId: string) =>
  useMutation(() => deleteXeroIntegration(serviceCompanyId));

export const getXeroAuthUrl = async (serviceCompanyId: string) => {
  const response = await axiosClient.get<string>(
    `/api/serviceCompanies/${serviceCompanyId}/xero/auth/url`,
  );
  return response.data;
};
export const useServiceCompanyXeroAuthUrl = (serviceCompanyId: string) =>
  useQuery(queryKeys.fetchXeroAuthUrl, () => getXeroAuthUrl(serviceCompanyId), {
    enabled: !!serviceCompanyId,
  });

export const createServiceCompanySettingXeroConnect = async (
  serviceCompanyId: string,
  code: string,
) => {
  const response = await axiosClient.post(
    `/api/serviceCompanies/${serviceCompanyId}/xero/connect`,
    {
      serviceCompanyId,
      code,
    },
  );
  return response.data;
};

export const useServiceCompanySettingXeroConnect = (serviceCompanyId: string) =>
  useMutation(({code}: {code: string}) =>
    createServiceCompanySettingXeroConnect(serviceCompanyId, code),
  );
