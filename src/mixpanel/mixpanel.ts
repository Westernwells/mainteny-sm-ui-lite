import mixpanel from 'mixpanel-browser';
import {getStoredUser} from '../userStorage/index';

const isProduction = process.env.NODE_ENV === 'production';

mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN || '', {
  debug: !isProduction,
});

const user = getStoredUser();

if (user) {
  mixpanel.register({
    userId: user.userAccount.id,
    userName: user.userAccount.username,
    serviceCompanyId: user.userAccount.serviceCompany.id,
    serviceCompanyName: user.userAccount.serviceCompany.name,
  });
}

interface Dict {
  [key: string]: any;
}

const actions = {
  identify: (id?: string | undefined) => {
    if (isProduction) mixpanel.identify(id);
  },
  track: (name: string, props?: Dict | undefined) => {
    if (isProduction) mixpanel.track(name, props);
  },
  identifyAndTrack: (name: string, props?: Dict | undefined) => {
    actions.identify(user?.userAccount.id);
    actions.track(name, props);
  },
};

export const Mixpanel = actions;
