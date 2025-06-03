import {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation, useNavigate} from 'react-router-dom';
import {axiosClient} from 'utils/axios-utils';

import {clearStoredAdmin, getStoredAdmin} from 'userStorage';
import {useSnackbar} from 'hooks/useSnackbar';
import {useUserSession} from './reactQuery/useUserSession';
import {UserSession} from '../models/session';
import {Role, UserAccount} from '../models/user';

interface UseAuth {
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  signout: () => void;
  loading: boolean;
  user: UserAccount | null;
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
  const {clearUser, updateUser, user} = useUserSession();
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
      const {data: session} = await axiosClient.post<UserSession>(urlEndpoint, {
        username: email,
        password,
      });

      if (session?.token) {
        if (
          !(
            session.userAccount.roles.includes(Role.SERVICE_MANAGER) ||
            session.userAccount.roles.includes(Role.ADMIN)
          )
        ) {
          enqueueSnackbar(
            `${t(
              'You don’t have access to Mainteny web portal. Please contact your system administrator.',
            )}`,
            {
              variant: 'warning',
            },
          );
          setLoading(false);
          return;
        }

        axiosClient.defaults.headers.common.Authorization = `Bearer ${session.token}`;
        updateUser(session);

        if (location.state?.from) {
          navigate(
            `${location.state.from.pathname}${
              location.state.from.search || ''
            }`,
            {replace: true},
          );
        } else {
          if (session.userAccount.roles.includes(Role.ADMIN)) {
            navigate('/admin/companies', {replace: true});
            return;
          }
          navigate('/', {replace: true});
        }
      }
    } catch (err: any) {
      showError(err);
      setLoading(false);
    }
  };

  const signin = async (email: string, password: string): Promise<void> => {
    authRequest('/api/sessions/login', email, password);
  };

  const signup = async (email: string, password: string): Promise<void> => {
    authRequest('/user', email, password);
  };

  const signout = async (): Promise<void> => {
    try {
      const result = await axiosClient.post<UserSession>(
        '/api/sessions/logout',
        {},
      );
      if (result.status === 200) {
        clearUser();
        axiosClient.defaults.headers.common.Authorization = '';
        if (adminUser) {
          axiosClient.defaults.headers.common.Authorization = `Bearer ${adminUser.token}`;
          updateUser(adminUser);
          clearStoredAdmin();
          navigate('/admin/companies', {replace: true});
          return;
        }
        navigate('/login', {replace: true});
      }
    } catch (err) {
      showError(err);
    }
  };

  return {
    signin,
    signup,
    signout,
    loading,
    user: user?.userAccount ?? null,
  };
};
