import Axios from 'axios';
import {getStoredUser} from 'userStorage';

const header = {} as any;
const user = getStoredUser();
if (user) {
  header.Authorization = `Bearer ${user.token}`;
}

export const axiosClient = Axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    source: 'WEB',
    // ...header,
  },
});
if (user) {
  axiosClient.defaults.headers.common.Authorization = `Bearer ${user.token}`;
}

export const paramsSerializer = (parameters: {[key: string]: any}) => {
  const items = Object.keys(parameters).map((key) => {
    const value = parameters[key];
    if (Array.isArray(value)) {
      return value.map((v) => `${key}=${v}`);
    }
    return `${key}=${value}`;
  });

  return items.flat().join('&');
};
