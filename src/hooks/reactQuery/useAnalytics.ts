import {useQuery, UseQueryOptions} from 'react-query';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {
  FormatType,
  QueryDatevFinancials,
  QueryFinancials,
  QueryWorkingHours,
  ReportType,
} from 'models/analytics';
import {toRestDateTime} from 'utils/datetime';
import {DataSyncStatus, DataSyncStatusParams} from 'models/service-company';
import {AxiosResponse} from 'axios';
import {queryKeys} from 'reactQuery/constants';
import {RestError} from 'models/misc';
import {useUserSession} from './useUserSession';
import {useCompanyXeroInfo} from './useCompanies';

export const download = (blob: Blob, filename: string, ext?: string) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.setAttribute(
    'download',
    `${filename}_${toRestDateTime(new Date())}${ext ?? ''}`,
  );
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
        showError(err);
      },
      enabled: false,
    },
  );
};

export const fetchInvoicesDatev = async (
  serviceCompanyId: string,
  params: QueryDatevFinancials,
): Promise<AxiosResponse<Blob>> =>
  axiosClient.get<Blob>(`/api/reports/${serviceCompanyId}/datev/invoices.csv`, {
    headers: {
      accept: 'text/csv',
    },
    responseType: 'blob',
    params,
    paramsSerializer,
  });

export const useInvoicesDatev = (
  serviceCompanyId: string,
  params: QueryDatevFinancials,
) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useQuery(
    [FormatType.DATEV, serviceCompanyId, params],
    () => fetchInvoicesDatev(serviceCompanyId, params),
    {
      onSuccess: (response) => {
        // parse filename from Content-Disposition header (RFC 5987 compliant)
        const disposition = response.headers['content-disposition'] || '';
        const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/.exec(disposition);
        const filename = match
          ? decodeURIComponent(match[1])
          : `EXTF_Buchungsstapel_${toRestDateTime(new Date())}.csv`;

        // trigger download with exact header filename
        const blob = response.data;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        enqueueSnackbar('Report downloaded successfully!', {
          variant: 'success',
        });
      },
      onError: (err) => {
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
        showError(err);
      },
      enabled: false,
    },
  );
};

export const fetchInvoicesXLSX = async (
  serviceCompanyId: string,
  params: QueryFinancials,
) => {
  const response = await axiosClient.get(
    `/api/reports/${serviceCompanyId}/invoices.xlsx`,
    {
      headers: {
        accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      responseType: 'blob',
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export const useInvoicesXLSX = (
  serviceCompanyId: string,
  params: QueryFinancials,
) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useQuery(
    [FormatType.EXCEL, serviceCompanyId, params],
    () => fetchInvoicesXLSX(serviceCompanyId, params),
    {
      onSuccess: (data) => {
        download(data, ReportType.FINANCIALS);
        enqueueSnackbar('Report downloaded successfully!', {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
      enabled: false,
    },
  );
};

export const fetchInvoicesSage50 = async (
  serviceCompanyId: string,
  params: QueryFinancials,
) => {
  const response = await axiosClient.get(
    `/api/reports/${serviceCompanyId}/saga50.csv`,
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

export const useInvoicesSage50 = (
  serviceCompanyId: string,
  params: QueryFinancials,
) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useQuery(
    [FormatType.SAGE50, serviceCompanyId, params],
    () => fetchInvoicesSage50(serviceCompanyId, params),
    {
      onSuccess: (data) => {
        download(data, ReportType.FINANCIALS);
        enqueueSnackbar('Report downloaded successfully!', {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
      enabled: false,
    },
  );
};

export const fetchInvoicesDf2 = async (
  serviceCompanyId: string,
  params: QueryFinancials,
) => {
  const response = await axiosClient.get(
    `/api/reports/${serviceCompanyId}/invoice.df2`,
    {
      headers: {
        accept: 'application/octet-stream',
      },
      responseType: 'blob',
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export const useInvoicesDf2 = (
  serviceCompanyId: string,
  params: QueryFinancials,
) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useQuery(
    [FormatType.DF2, serviceCompanyId, params],
    () => fetchInvoicesDf2(serviceCompanyId, params),
    {
      onSuccess: (data) => {
        download(data, ReportType.FINANCIALS, '.df2');
        enqueueSnackbar('Report downloaded successfully!', {
          variant: 'success',
        });
      },
      onError: (err) => {
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

export const useSyncStatusXero = (
  params: DataSyncStatusParams,
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  const {data: xeroInfoData} = useCompanyXeroInfo(
    user?.userAccount.serviceCompany.id,
  );
  return useQuery<DataSyncStatus, RestError>(
    [queryKeys.fetchSyncStatusXero, params.serviceCompanyId, params.type],
    () => fetchSyncStatusXero(params),
    {
      enabled: !!user && !!params.serviceCompanyId && !!xeroInfoData?.enabled,
      ...options,
    },
  );
};

export const fetchInvoicesPdfUrls = async (
  serviceCompanyId: string,
  params: QueryFinancials,
) => {
  const response = await axiosClient.get(
    `/api/serviceCompanies/${serviceCompanyId}/invoice/pdfPaths`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export const useInvoicesPdfUrls = (
  serviceCompanyId: string,
  params: QueryFinancials,
) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useQuery(
    [serviceCompanyId, params],
    () => fetchInvoicesPdfUrls(serviceCompanyId, params),
    {
      onSuccess: (response) => {
        if (response.length) {
          enqueueSnackbar('PDF Documents downloaded successfully!', {
            variant: 'success',
          });
        }
      },
      onError: (err) => {
        showError(err);
      },
      enabled: false,
    },
  );
};
