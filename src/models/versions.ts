import {Page} from './pagination';

export enum VersionType {
  WEB_STAGING = 'WEB_STAGING',
  WEB_RELEASE = 'WEB_RELEASE',
  WEB_PROD = 'WEB_PROD',
}

export interface GetVersionsParams extends Partial<Page> {
  type: VersionType;
}

export interface Version {
  id: string;
  type: string;
  value: string;
  changelog: string;
  releaseTime: string;
}
