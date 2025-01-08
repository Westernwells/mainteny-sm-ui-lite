import {DataSyncType} from 'models/service-company';
import {useEffect, useState} from 'react';
import {locales} from 'utils/datetime';
import {srLatn} from 'date-fns/locale';
import {mapLanguageToLocale} from 'utils/language';
import {useSyncStatusXero} from './reactQuery/useAnalytics';
import {useUserSession} from './reactQuery/useUserSession';
import {useFormatDateDistance} from './useFormatDateDistance';

type Props = {
  syncType: DataSyncType;
};

const useLastSyncedItem = ({syncType}: Props) => {
  const {user} = useUserSession();

  const language = user?.userAccount.serviceCompany.language;
  const locale = mapLanguageToLocale[language!];

  const {data: lastSyncInfo, isLoading} = useSyncStatusXero({
    serviceCompanyId: user?.userAccount.serviceCompany.id,
    type: syncType,
  });

  const formatDistance = useFormatDateDistance();

  const [lastSyncedText, setLastSyncedText] = useState('');

  useEffect(() => {
    setLastSyncedText(
      formatDistance(
        lastSyncInfo?.lastSyncedTime
          ? new Date(lastSyncInfo?.lastSyncedTime!!)
          : new Date(),
        new Date(),
        {
          locale: locales[locale] || srLatn,
          addSuffix: true,
        },
      ),
    );
  }, [lastSyncInfo, locale]);

  return {lastSyncedText, isLoading};
};

export default useLastSyncedItem;
