import {useState} from 'react';
import {axiosClient} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {useNavigate} from 'react-router-dom';

interface UseRecoverPassword {
  request: (email: string, navigation?: boolean) => Promise<void>;
  reset: (token: string, password: string, email: string) => Promise<void>;
  loading: boolean;
}

export const useResetPassword = (): UseRecoverPassword => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const request = async (
    email: string,
    navigation?: boolean,
  ): Promise<void> => {
    setLoading(true);
    try {
      const {status} = await axiosClient({
        url: `/api/users/${email}/forgetPassword/token`,
        method: 'POST',
      });
      setLoading(false);

      enqueueSnackbar('Code sent successfully to your email', {
        variant: 'success',
      });

      if (status === 200 && navigation) {
        navigate('/reset-password?type=reset');
      }
    } catch (error: any) {
      showError(error);
      setLoading(false);
      console.error(error);
    }
  };
  const reset = async (
    token: string,
    password: string,
    email: string,
  ): Promise<void> => {
    setLoading(true);
    try {
      const {status} = await axiosClient.post(
        '/api/users/forgetPassword/reset',
        {password, token},
      );
      setLoading(false);

      if (status === 200) {
        enqueueSnackbar('Password reset successfully', {
          variant: 'success',
        });
        localStorage.setItem('email', email);
        navigate('/login?authType=reset');
      }
    } catch (error: any) {
      showError(error);
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
