export enum ReportType {
  FINANCIALS = 'FINANCIALS',
  WORK_HOURS = 'WORK HOURS',
}

export enum FormatType {
  EXCEL = 'Excel',
  CSV = 'CSV',
  XERO = 'Xero',
  DATEV = 'DATEV',
  SAGE50 = 'Sage50 (csv)',
}

export interface QueryWorkingHours {
  serviceCompanyId: string;
  startDate: string;
  endDate: string;
}

export interface QueryFinancials {
  startDate: string;
  endDate: string;
  full?: boolean;
}
