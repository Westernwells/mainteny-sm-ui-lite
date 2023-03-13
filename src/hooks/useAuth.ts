import {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation, useNavigate} from 'react-router-dom';
import {axiosClient} from 'utils/axios-utils';

import {clearStoredAdmin, getStoredAdmin} from 'userStorage';
import {useSnackbar} from 'hooks/useSnackbar';
import {useUserSession} from './reactQuery/useUserSession';
import {UserSession} from '../models/session';
import {Role} from '../models/user';

interface UseAuth {
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signout: () => void;
  loading: boolean;
}

interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: any;
  key: string;
}

export const useAuth = (): UseAuth => {
  const {t} = useTranslation();
  const {clearUser, updateUser} = useUserSession();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location: Location = useLocation();
  const {enqueueSnackbar, showError} = useSnackbar();

  const adminUser = getStoredAdmin();

  useEffect(() => () => setLoading(false), []);

  const authRequest = async (
    urlEndpoint: string,
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      setLoading(true);
      const {data: user} = await axiosClient.post<UserSession>(urlEndpoint, {
        username: email,
        password,
      });

      if (user?.token) {
        if (
          !(
            user.userAccount.roles.includes(Role.SERVICE_MANAGER) ||
            user.userAccount.roles.includes(Role.ADMIN)
          )
        ) {
          enqueueSnackbar(
            `${t('Uh oh! As a Property Manager, please login at')} ${
              import.meta.env.REACT_APP_PMUI_URL
            }`,
            {
              variant: 'warning',
            },
          );
          return;
        }
        axiosClient.defaults.headers.common.Authorization = `Bearer ${user.token}`;
        // update stored user data
        updateUser(user);
        if (location.state?.from) {
          navigate(
            `${location.state.from.pathname}${
              location.state.from.search ? location.state.from.search : ''
            }`,
            {replace: true},
          );
        } else {
          if (user.userAccount.roles.includes(Role.ADMIN)) {
            navigate('/admin/companies', {replace: true});
            return;
          }
          navigate('/', {replace: true});
        }
      }
    } catch (err: any) {
      showError(err);
      setLoading(false);
      console.log(err);
    }
  };

  const signin = async (email: string, password: string): Promise<void> => {
    authRequest('/api/sessions/login', email, password);
  };
  const signup = async (email: string, password: string): Promise<void> => {
    authRequest('/user', email, password);
  };

  const signout = (): void => {
    clearUser();
    if (adminUser) {
      axiosClient.defaults.headers.common.Authorization = `Bearer ${adminUser.token}`;
      updateUser(adminUser);
      clearStoredAdmin();
      navigate('/admin/companies', {replace: true});
      return;
    }
    navigate('/login', {replace: true}); // This resets the location state
  };

  // Return the user object and auth methods
  return {
    signin,
    signup,
    signout,
    loading,
  };
};
