import {useState} from 'react';
import {axiosClient} from 'utils/axios-utils';
import {useSnackbar} from 'notistack';
import {useNavigate} from 'react-router';

interface UseRecoverPassword {
  request: (email: string, snackbar?: boolean) => Promise<void>;
  reset: (token: string, password: string) => Promise<void>;
  loading: boolean;
}

export const useRecoverPassword = (): UseRecoverPassword => {
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const request = async (email: string, snackbar = false): Promise<void> => {
    setLoading(true);
    try {
      const {data} = await axiosClient({
        url: `/api/users/${email}`,
      });

      if (data?.roles.includes('SERVICE_MANAGER')) {
        const {status} = await axiosClient({
          url: `/api/users/${email}/forgetPassword/token`,
          method: 'POST',
        });
        setLoading(false);

        if (status === 200 && snackbar) {
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
      } else {
        enqueueSnackbar('Invalid account', {
          variant: 'error',
        });
      }

      setLoading(false);
      console.error(error);
    }
  };
  const reset = async (token: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const {status} = await axiosClient({
        url: `/api/users/forgetPassword/reset?password=${password}&token=${token}`,
        method: 'POST',
      });
      setLoading(false);

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
      setLoading(false);
      console.error(error);
    }
  };

  return {
    request,
    reset,
    loading,
  };
};
