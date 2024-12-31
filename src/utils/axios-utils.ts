import Axios from 'axios';
import * as Sentry from '@sentry/react';
import {getStoredUser} from 'userStorage';

const user = getStoredUser();

export const axiosClient = Axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    source: 'WEB',
  },
});

if (user) {
  axiosClient.defaults.headers.common.Authorization = `Bearer ${user.token}`;
  axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (Axios.isAxiosError(error)) {
        // Don't log 401 unauthorized errors or network errors to Sentry
        if (
          error.response?.status !== 401 &&
          error.message !== 'Network Error'
        ) {
          Sentry.setContext('Axios', {
            method: error.config?.method,
            endpoint: error.config?.url,
            fullUrl: error.request?.responseURL,
            body: error.config?.data,
            status: error.response?.status,
            message: error.response?.data?.message,
          });
          Sentry.captureException(
            error.response?.data?.message
              ? new Error(error.response?.data?.message)
              : error,
          );
        }
      } else {
        Sentry.captureException(error);
      }
      return Promise.reject(error);
    },
  );
}

export const paramsSerializer = (parameters: {[key: string]: any}) => {
  const items = Object.keys(parameters).map((key) => {
    const value = parameters[key];
    if (Array.isArray(value)) {
      return value.map((v) => `${key}=${v}`);
    }

    // serialize default date object
    if (value instanceof Date) {
      return `${key}=${(value as Date).toJSON()}`;
    }

    return `${key}=${value}`;
  });

  return items.flat().join('&');
};
