import {useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {axiosClient} from 'utils/axios-utils';
import {useSnackbar} from 'notistack';
import {useUserSession} from './reactQuery/useUserSession';

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
      const {data: user, status} = await axiosClient({
        url: urlEndpoint,
        method: 'POST',
        data: {username: email, password},
      });

      console.log(status, '######');

      if (user?.token) {
        axiosClient.defaults.headers.common.Authorization = `Bearer ${user.token}`;
        // update stored user data
        updateUser(user);
        if (location.state?.from) {
          navigate(`/${location.state.from.pathname}`, {replace: true});
        } else {
          navigate('/units', {replace: true});
        }
      }
    } catch (errorResponse: any) {
      if (errorResponse?.response.status === 400) {
        console.log('#########');
        enqueueSnackbar('Incorrect email or password', {
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
    navigate('/', {replace: true}); // This resets the location state
  };

  // Return the user object and auth methods
  return {
    signin,
    signup,
    signout,
    loading,
  };
};
