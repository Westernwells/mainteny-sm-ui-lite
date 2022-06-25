import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation, useNavigate} from 'react-router-dom';
import {axiosClient} from 'utils/axios-utils';
import {useSnackbar} from 'notistack';
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
  const {enqueueSnackbar} = useSnackbar();

  const authRequest = async (
    urlEndpoint: string,
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      setLoading(true);
      const {data: user, status} = await axiosClient.post<UserSession>(
        urlEndpoint,
        {
          username: email,
          password,
        },
      );

      console.log(status, '######');

      if (user?.token) {
        if (!user.userAccount.roles.includes(Role.SERVICE_MANAGER)) {
          enqueueSnackbar(
            `Uh oh! As a Property Manager, please login at ${process.env.REACT_APP_PMUI_URL}`,
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
            `/${location.state.from.pathname}${
              location.state.from.search ? location.state.from.search : ''
            }`,
            {replace: true},
          );
        } else {
          navigate('/orders', {replace: true});
        }
      }
    } catch (errorResponse: any) {
      if (errorResponse?.response.status === 400) {
        enqueueSnackbar(t('Incorrect email or password'), {
          variant: 'error',
        });
      }
      console.log(errorResponse);
    } finally {
      setLoading(false);
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
