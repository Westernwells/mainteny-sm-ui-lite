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
  DF2 = 'DF2 (df2)',
  DATEV_WITH_PDF = 'DATEV with PDFs',
  EXCEL_WITH_PDF = 'Excel with PDFs',
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
  includePayments?: boolean;
}
