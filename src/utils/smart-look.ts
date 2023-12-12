import Smartlook from 'smartlook-client';

export const initSmartlook = () =>
  Smartlook.init(process.env.REACT_APP_SMARTLOOK_KEY || '');
