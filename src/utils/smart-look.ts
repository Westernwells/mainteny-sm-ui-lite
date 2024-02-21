import Smartlook from 'smartlook-client';

export const initSmartlook = () => {
  const smartlookKey = import.meta.env.REACT_APP_SMARTLOOK_KEY;
  if (!smartlookKey) {
    console.error(
      'Smartlook key is missing. Smartlook will not be initialized.',
    );
    return;
  }
  Smartlook.init(smartlookKey);
};
