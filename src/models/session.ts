import {UserAccount} from './user';

export interface UserSession {
  token: string;
  userAccount: UserAccount;
  createdAt: string;
  lastUpdatedAt: string;
  expiredAt: string;
}
