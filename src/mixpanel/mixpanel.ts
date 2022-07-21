import mixpanel from 'mixpanel-browser';
import {getStoredUser} from '../userStorage/index';

const isProduction = process.env.NODE_ENV === 'production';

mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN || '', {
  debug: !isProduction,
});

const registerMixpanelCustomProperties =
  (fn: (...args: any) => void) =>
  (...args: any) => {
    if (!isProduction) {
      return;
    }

    const user = getStoredUser();
    if (user) {
      mixpanel.register({
        userId: user.userAccount.id,
        userName: user.userAccount.username,
        serviceCompanyId: user.userAccount.serviceCompany.id,
        serviceCompanyName: user.userAccount.serviceCompany.name,
      });
    }

    return fn(...args);
  };

interface Dict {
  [key: string]: any;
}

const actions = {
  identify: registerMixpanelCustomProperties((id?: string | undefined) => {
    mixpanel.identify(id);
  }),
  track: registerMixpanelCustomProperties(
    (name: string, props?: Dict | undefined) => {
      mixpanel.track(name, props);
    },
  ),
  identifyAndTrack: registerMixpanelCustomProperties(
    (name: string, props?: Dict | undefined) => {
      const user = getStoredUser();
      actions.identify(user?.userAccount.id);
      actions.track(name, props);
    },
  ),
  timeEvent: registerMixpanelCustomProperties((name: string) => {
    mixpanel.time_event(name);
  }),
};

export const Mixpanel = actions;
