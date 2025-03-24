import {FormatType, ReportType} from 'models/analytics';

export type ReportsForm = {
  reportType: ReportType;
  formatType: FormatType;
  startDate: Date | null;
  endDate: Date | null;
  includePDFDocuments: boolean;
  includePreviouslyDownloadedData: boolean;
  includePaymentsData: boolean;
  includeInvoicesData: boolean;
  includePurchaseInvoicesData: boolean;
};
