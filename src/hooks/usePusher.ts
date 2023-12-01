import {useEffect, useState} from 'react';
import Pusher from 'pusher-js';
import * as PusherTypes from 'pusher-js';
import {getStoredUser} from 'userStorage';
import {UserSession} from 'models/session';
import {MessageType} from 'models/notification';
import {useTranslation} from 'react-i18next';
import {useSnackbar} from './useSnackbar';

const useEvent = <D>(
  channel: PusherTypes.Channel | PusherTypes.PresenceChannel | undefined,
  eventName: MessageType,
  callback: (data?: D, metadata?: {user_id: string}) => void,
) => {
  useEffect(() => {
    if (channel === undefined) {
      return;
    }

    channel.bind(eventName, callback);

    return () => {
      channel.unbind(eventName, callback);
    };
  }, [channel, eventName, callback]);
};

export const usePusher = ({
  onMessageReceived,
}: {
  onMessageReceived: (event: MessageType | string) => void;
}) => {
  const {t} = useTranslation();
  const {enqueueSnackbar} = useSnackbar();
  const [channel, setChannel] = useState<PusherTypes.Channel>();

  useEvent(
    channel,
    MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER,
    () => {
      enqueueSnackbar(
        t(
          'No reached-out technicians accepted the order. Please assign manually',
        ),
        {
          variant: 'warning',
        },
      );
    },
  );

  const deregisterPusher = () => {
    channel?.unsubscribe();
    setChannel(undefined);
  };

  const registerPusher = ({user}: {user: UserSession}) => {
    deregisterPusher();

    const pusher = new Pusher(import.meta.env.REACT_APP_PUSHER_KEY || '', {
      cluster: 'eu',
      authEndpoint: `${import.meta.env.REACT_APP_API_URL}/api/auth/pusher`,
      auth: {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      },
    });

    const subscribedChannel = pusher.subscribe(
      `private-${getStoredUser()?.userAccount.serviceCompany.id}`,
    );
    subscribedChannel.bind_global((event: MessageType | string) => {
      if (event === 'pusher:subscription_succeeded') {
        return;
      }
      onMessageReceived(event);
    });

    setChannel(subscribedChannel);
  };

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      registerPusher({user});
    } else {
      deregisterPusher();
    }

    return () => {
      deregisterPusher();
    };
  }, []);
};
