import {ErrorCode, ErrorMessage} from 'models/error';
import {RestError} from 'models/misc';
import {
  OptionsObject,
  ProviderContext,
  SnackbarMessage,
  useSnackbar as useNotistackSnackbar,
} from 'notistack';
import {useTranslation} from 'react-i18next';

export const useSnackbar = (): ProviderContext & {
  showError: (err: any) => void;
} => {
  const {t} = useTranslation();
  const {enqueueSnackbar: enqueueNotistackSnackbar, closeSnackbar} =
    useNotistackSnackbar();

  const enqueueSnackbar = (message: SnackbarMessage, options?: OptionsObject) =>
    enqueueNotistackSnackbar(
      typeof message === 'string' ? t(message) : message,
      options,
    );

  const showError = (err: any) => {
    const responseErrorCode = (err?.response?.data as RestError)?.errorCode;

    const errorCodeEnumArrayOfObject = Object.entries(ErrorCode).map(
      ([type, code]) => {
        const errorMessage = ErrorMessage[type as keyof typeof ErrorMessage];
        return {
          type,
          code,
          message: errorMessage,
        };
      },
    );

    const foundError = errorCodeEnumArrayOfObject.find(
      (i) => i.code === responseErrorCode,
    );

    enqueueSnackbar(foundError?.message ?? ErrorMessage.DEFAULT, {
      variant: 'error',
    });
  };

  return {enqueueSnackbar, closeSnackbar, showError};
};
