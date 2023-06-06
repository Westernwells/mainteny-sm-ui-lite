import {useNavigate} from 'react-router-dom';
import {setStoredAdmin} from 'userStorage';
import {axiosClient} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {useUserSession} from './useUserSession';

export const useServiceManager = () => {
  const navigate = useNavigate();
  const {enqueueSnackbar, showError} = useSnackbar();
  const {user, updateUser} = useUserSession();

  const getImpersonateUser = async (username: string): Promise<void> => {
    try {
      const {data: impersonateUser} = await axiosClient.post(
        `/api/sessions/runAs`,
        null,
        {
          params: {
            username,
          },
        },
      );

      if (impersonateUser?.token) {
        if (user) {
          enqueueSnackbar(
            `You are logged as ${impersonateUser?.userAccount?.username}`,
            {
              variant: 'success',
            },
          );
          setStoredAdmin(user);
        }

        axiosClient.defaults.headers.common.Authorization = `Bearer ${impersonateUser.token}`;
        updateUser(impersonateUser);
        navigate('/', {replace: true});
      }
    } catch (error: any) {
      console.error(error);
      showError(error);
    }
  };

  return {
    getImpersonateUser,
  };
};
