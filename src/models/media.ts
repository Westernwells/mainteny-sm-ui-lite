export interface FileResource {
  id: string;
  uri: string;
  type: string;
  description: string;
  createdAt: string;
  serviceCompanyId?: string;
}

export interface FileResourceRecord {
  description: string;
  type: string;
  uri: string;
}
