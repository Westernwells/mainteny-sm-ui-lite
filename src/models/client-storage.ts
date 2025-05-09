export interface ClientDataRecord {
  key: string;
  value: string;
}

export interface ClientReportForPDFConfig {
  includeUnitNumber?: boolean;
  includeSerialNumber?: boolean;
  includeUsername?: boolean;
  includeUserEmail?: boolean;
  includeUserPhone?: boolean;
  includeCustomerVAT?: boolean;
  includeUnitBuilding?: boolean;
}

export enum ClientStorageKeys {
  PDF_CONFIG = 'pdf-configurations',
  PDF_TEMPLATE = 'pdf-template',
  PDF_FONT = 'pdf-font',
  PDF_COLORS = 'pdf-colors',
  PDF_TEXT_COLOR = 'pdf-text-color',
}
