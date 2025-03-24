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

export interface QueryDatevFinancials {
  startDate: string;
  endDate: string;
  full?: boolean;
  includeInvoices?: boolean;
  includePayments?: boolean;
  includePurchaseInvoices?: boolean;
}
