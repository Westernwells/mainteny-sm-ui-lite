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
}
