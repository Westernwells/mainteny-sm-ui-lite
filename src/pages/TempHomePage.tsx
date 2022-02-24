import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useAuth} from 'hooks/useAuth';

export const TempHomePage = () => {
  const {user} = useUserSession();
  const {signout} = useAuth();

  return (
    <div style={{padding: '2rem'}}>
      <h4>HOMEPAGE: /units</h4>
      <h4>
        USER: {user?.userAccount.firstName} {user?.userAccount.lastName}
      </h4>
      <div>
        <button type="button" onClick={() => signout()}>
          Logout
        </button>
      </div>
    </div>
  );
};
