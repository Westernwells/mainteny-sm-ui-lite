import {AxiosError} from 'axios';
import {clearStoredUser} from 'userStorage';

export const queryErrorHandler = (error: unknown) => {
  const err = error as AxiosError;
  if (err.response?.status === 401) {
    clearStoredUser();
    window.location.replace('/login');
  }
};

export const MutationErrorHandler = (error: unknown) => {
  const err = error as AxiosError;
  if (err.response?.status === 401) {
    window.location.replace('/login');
  }
};
