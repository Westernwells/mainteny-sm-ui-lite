import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {axiosClient} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {useNavigate} from 'react-router-dom';

interface UseRecoverPassword {
  request: (email: string, navigation?: boolean) => Promise<void>;
  reset: (token: string, password: string, email: string) => Promise<void>;
  loading: boolean;
}

export const useResetPassword = (): UseRecoverPassword => {
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  const request = async (
    email: string,
    navigation?: boolean,
  ): Promise<void> => {
    const {t} = useTranslation();
    setLoading(true);
    try {
      const {status} = await axiosClient({
        url: `/api/users/${email}/forgetPassword/token`,
        method: 'POST',
      });
      setLoading(false);

      enqueueSnackbar(t('Code sent successfully'), {
        variant: 'success',
      });

      if (status === 200 && navigation) {
        navigate('/reset-password?type=reset');
      }
    } catch (error: any) {
      if (error?.response.status === 400) {
        enqueueSnackbar(t('User account not found'), {
          variant: 'error',
        });
      } else {
        enqueueSnackbar(
          t(
            'Sorry, we failed to fulfill the request at this time. Please try again.',
          ),
          {
            variant: 'error',
          },
        );
      }

      setLoading(false);
      console.error(error);
    }
  };
  const reset = async (
    token: string,
    password: string,
    email: string,
  ): Promise<void> => {
    const {t} = useTranslation();
    setLoading(true);
    try {
      const {status} = await axiosClient.post(
        '/api/users/forgetPassword/reset',
        {password, token},
      );
      setLoading(false);

      if (status === 200) {
        enqueueSnackbar(t('Password reset successfully'), {
          variant: 'success',
        });
        localStorage.setItem('email', email);
        navigate('/login?authType=reset');
      }
    } catch (error: any) {
      if (error?.response.status === 400) {
        enqueueSnackbar(t('Invalid Code'), {
          variant: 'error',
        });
      } else {
        enqueueSnackbar(
          t(
            'Sorry, we failed to fulfill the request at this time. Please try again.',
          ),
          {
            variant: 'error',
          },
        );
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
