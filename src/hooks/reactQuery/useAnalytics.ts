import {useQuery} from 'react-query';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {
  FormatType,
  QueryFinancials,
  QueryWorkingHours,
  ReportType,
} from 'models/analytics';
import {toRestDateTime} from 'utils/datetime';
import {DataSyncStatus, DataSyncStatusParams} from 'models/service-company';
import {AxiosResponse} from 'axios';
import {queryKeys} from 'reactQuery/constants';

export const download = (blob: Blob, filename: string) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.setAttribute('download', `${filename}_${toRestDateTime(new Date())}`);
  a.click();
};

export const fetchEmployeeWorkingHoursCSV = async (
  params: QueryWorkingHours,
) => {
  const response = await axiosClient.get(`/api/reports/workingHours.csv`, {
    headers: {
      accept: 'text/csv',
    },
    responseType: 'blob',
    params,
    paramsSerializer,
  });

  return response.data;
};

export const useEmployeeWorkingHoursCSV = (params: QueryWorkingHours) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useQuery(
    [FormatType.CSV, params],
    () => fetchEmployeeWorkingHoursCSV(params),
    {
      onSuccess: (data) => {
        download(data, ReportType.WORK_HOURS);
        enqueueSnackbar('Report downloaded successfully!', {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        showError(err);
      },
      enabled: false,
    },
  );
};

export const fetchEmployeeWorkingHoursXLSX = async (
  params: QueryWorkingHours,
) => {
  const response = await axiosClient.get(`/api/reports/workingHours.xlsx`, {
    headers: {
      accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
    responseType: 'blob',
    params,
    paramsSerializer,
  });

  return response.data;
};

export const useEmployeeWorkingHoursXLSX = (params: QueryWorkingHours) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useQuery(
    [FormatType.EXCEL, params],
    () => fetchEmployeeWorkingHoursXLSX(params),
    {
      onSuccess: (data) => {
        download(data, ReportType.WORK_HOURS);
        enqueueSnackbar('Report downloaded successfully!', {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        showError(err);
      },
      enabled: false,
    },
  );
};

export const fetchInvoicesDatev = async (
  serviceCompanyId: string,
  params: QueryFinancials,
) => {
  const response = await axiosClient.get(
    `/api/reports/${serviceCompanyId}/datev/invoices.csv`,
    {
      headers: {
        accept: 'text/csv',
      },
      responseType: 'blob',
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export const useInvoicesDatev = (
  serviceCompanyId: string,
  params: QueryFinancials,
) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useQuery(
    [FormatType.DATEV, serviceCompanyId, params],
    () => fetchInvoicesDatev(serviceCompanyId, params),
    {
      onSuccess: (data) => {
        download(data, ReportType.FINANCIALS);
        enqueueSnackbar('Report downloaded successfully!', {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        showError(err);
      },
      enabled: false,
    },
  );
};

export const fetchInvoicesXero = async (
  serviceCompanyId: string,
  params: QueryFinancials,
) => {
  const response = await axiosClient.get(
    `/api/reports/${serviceCompanyId}/xero/invoices.csv`,
    {
      headers: {
        accept: 'text/csv',
      },
      responseType: 'blob',
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export const useInvoicesXero = (
  serviceCompanyId: string,
  params: QueryFinancials,
) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useQuery(
    [FormatType.XERO, serviceCompanyId, params],
    () => fetchInvoicesXero(serviceCompanyId, params),
    {
      onSuccess: (data) => {
        download(data, ReportType.FINANCIALS);
        enqueueSnackbar('Report downloaded successfully!', {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        showError(err);
      },
      enabled: false,
    },
  );
};

const fetchSyncStatusXero = async (params: DataSyncStatusParams) => {
  const response: AxiosResponse<DataSyncStatus> = await axiosClient.get(
    `/api/system/xero/synchronization/status`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useSyncStatusXero = (params: DataSyncStatusParams) =>
  useQuery(
    [queryKeys.fetchSyncStatusXero, params.serviceCompanyId, params.type],
    () => fetchSyncStatusXero(params),
  );
