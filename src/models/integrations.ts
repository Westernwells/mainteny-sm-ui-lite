export interface XeroIntegrationView {
  enabled?: boolean;
  clientId: string;
  tenantId: string;
  secretFingerprint: string;
}

export interface XeroIntegrationRecord {
  enabled: boolean;
  clientId: string;
  secret?: string;
  tenantId: string;
}
