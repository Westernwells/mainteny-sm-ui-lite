import {useQuery, useQueryClient} from 'react-query';
import {getStoredUser, setStoredUser, clearStoredUser} from 'userStorage';
import {queryKeys} from 'reactQuery/constants';
import {UserSession} from 'models/session';
import {differenceInMinutes} from 'date-fns';

interface UseUserSession {
  user?: UserSession | null;
  updateUser: (user: UserSession) => void; // eslint-disable-line
  clearUser: () => void;
}

export function useUserSession(): UseUserSession {
  const queryClient = useQueryClient();

  // TODO: call useQuery to update user data from server
  const {data: user} = useQuery(queryKeys.userSession, getStoredUser, {
    onSuccess: (data) => {
      if (data) {
        const currentDate = new Date();
        const expiredAt = new Date(data.expiredAt);
        const minuteDiff = differenceInMinutes(expiredAt, currentDate);
        if (minuteDiff <= 0) {
          clearStoredUser();
          queryClient.setQueryData(queryKeys.userSession, null);
        }
      }
    },
  });

  // meant to be called from useAuth
  function updateUser(newUser: UserSession): void {
    // update user in localstorage
    setStoredUser(newUser);

    //  pre-populate user profile in React Query client
    queryClient.setQueryData(queryKeys.userSession, newUser);
  }

  // meant to be called from useAuth
  const clearUser = () => {
    // remove from localstorage
    clearStoredUser();

    // reset user to null in query client
    queryClient.setQueryData(queryKeys.userSession, null);
  };

  return {user, updateUser, clearUser};
}
