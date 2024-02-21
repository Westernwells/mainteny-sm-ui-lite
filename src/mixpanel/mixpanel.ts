import mixpanel from 'mixpanel-browser';
import {getStoredUser} from '../userStorage/index';

const isProduction = import.meta.env.MODE === 'prod';

// Ensure Mixpanel is initialized before any action is taken
if (import.meta.env.REACT_APP_MIXPANEL_TOKEN) {
  mixpanel.init(import.meta.env.REACT_APP_MIXPANEL_TOKEN, {
    debug: !isProduction,
  });
} else {
  console.error('Mixpanel token is not set.');
}

const registerMixpanelCustomProperties =
  (fn: (...args: any) => void) =>
  (...args: any) => {
    if (!isProduction || !mixpanel.has_opted_in_tracking()) {
      // Skip Mixpanel actions if not in production or user has opted out
      return;
    }

    try {
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
    } catch (error) {
      console.error('Error registering Mixpanel custom properties:', error);
    }
  };

interface Dict {
  [key: string]: any;
}

const actions = {
  identify: registerMixpanelCustomProperties((id?: string | undefined) => {
    try {
      mixpanel.identify(id);
    } catch (error) {
      console.error('Error with Mixpanel identify:', error);
    }
  }),
  track: registerMixpanelCustomProperties(
    (name: string, props?: Dict | undefined) => {
      try {
        mixpanel.track(name, props);
      } catch (error) {
        console.error('Error with Mixpanel track:', error);
      }
    },
  ),
  identifyAndTrack: registerMixpanelCustomProperties(
    (name: string, props?: Dict | undefined) => {
      try {
        const user = getStoredUser();
        actions.identify(user?.userAccount.id);
        actions.track(name, props);
      } catch (error) {
        console.error('Error with Mixpanel identifyAndTrack:', error);
      }
    },
  ),
  timeEvent: registerMixpanelCustomProperties((name: string) => {
    try {
      mixpanel.time_event(name);
    } catch (error) {
      console.error('Error with Mixpanel timeEvent:', error);
    }
  }),
};

export const Mixpanel = actions;
