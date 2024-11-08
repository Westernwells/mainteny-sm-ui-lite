import {useEffect, useState} from 'react';
import {useFetchLatestVersion} from './reactQuery/useVersions';

const useVersionCheck = () => {
  const currentVersion = import.meta.env.REACT_APP_VERSION;
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const {data} = useFetchLatestVersion();
  useEffect(() => {
    const latestVersion = data?.value;
    if (latestVersion && currentVersion && latestVersion !== currentVersion) {
      setIsUpdateAvailable(true);
    }
  }, [data, currentVersion]);

  return {isUpdateAvailable};
};

export default useVersionCheck;
