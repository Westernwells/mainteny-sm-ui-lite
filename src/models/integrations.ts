export interface XeroIntegrationView {
  enabled?: boolean;
  clientId: string;
  tenantId: string;
  secretFingerprint: string;
  xeroAuthUrl?: string;
}

export interface XeroIntegrationRecord {
  redirectionUrl?: string;
  enabled: boolean;
  clientId: string;
  secret?: string;
  tenantId: string;
}
