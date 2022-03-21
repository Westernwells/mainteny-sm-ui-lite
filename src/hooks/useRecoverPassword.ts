import {axiosClient} from 'utils/axios-utils';
import {useSnackbar} from 'notistack';
import {useNavigate} from 'react-router';

interface UseRecoverPassword {
  request: (email: string, snackbar?: boolean) => Promise<void>;
  reset: (token: string, password: string) => Promise<void>;
}

export const useRecoverPassword = (): UseRecoverPassword => {
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();

  const request = async (email: string, snackbar = false): Promise<void> => {
    try {
      const {status} = await axiosClient({
        url: `/api/users/${email}/forgetPassword/token`,
        method: 'POST',
      });
      if (status === 200) {
        if (snackbar) {
          enqueueSnackbar('Code sent successfully', {
            variant: 'success',
          });
        } else {
          navigate('/recover?type=reset');
        }
      }
    } catch (error: any) {
      if (error?.response.status === 400) {
        enqueueSnackbar('User account not found', {
          variant: 'error',
        });
      }
      console.error(error);
    }
  };
  const reset = async (token: string, password: string): Promise<void> => {
    try {
      const {status} = await axiosClient({
        url: `/api/users/forgetPassword/reset?password=${password}&token=${token}`,
        method: 'POST',
      });
      if (status === 200) {
        enqueueSnackbar('Password reset successfully', {
          variant: 'success',
        });
        navigate('/login?authType=reset');
      }
    } catch (error: any) {
      if (error?.response.status === 400) {
        enqueueSnackbar('Invalid Code', {
          variant: 'error',
        });
      }
      console.error(error);
    }
  };

  return {
    request,
    reset,
  };
};
