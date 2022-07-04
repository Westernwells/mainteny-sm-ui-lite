import {
  OptionsObject,
  ProviderContext,
  SnackbarMessage,
  useSnackbar as useNotistackSnackbar,
} from 'notistack';
import {useTranslation} from 'react-i18next';

export const useSnackbar = (): ProviderContext => {
  const {t} = useTranslation();
  const {enqueueSnackbar: enqueueNotistackSnackbar, closeSnackbar} =
    useNotistackSnackbar();

  const enqueueSnackbar = (message: SnackbarMessage, options?: OptionsObject) =>
    enqueueNotistackSnackbar(
      typeof message === 'string' ? t(message) : message,
      options,
    );

  return {enqueueSnackbar, closeSnackbar};
};
