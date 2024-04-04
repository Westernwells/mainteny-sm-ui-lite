import {useState, useEffect} from 'react';
import {getBase64FromUrl} from 'utils/utils';
import {UserSession} from 'models/session';
import {useDownloadUrl} from './reactQuery/useDownloadUrl';

function useLogoImage(user: UserSession | null | undefined) {
  const [imageUrl, setImageUrl] = useState('');
  const logoUrlPath =
    user?.userAccount?.serviceCompany?.settings?.whiteLabel?.logoPath;

  const {data: logoUrl = {}} = useDownloadUrl(
    logoUrlPath ? [logoUrlPath] : [],
    undefined,
    user?.userAccount.serviceCompany.id,
  );

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      if (!imageUrl && logoUrlPath) {
        const fetchedImageUrl = await getBase64FromUrl(logoUrl[logoUrlPath!]);

        if (isMounted && fetchedImageUrl) {
          setImageUrl(fetchedImageUrl);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [logoUrl[logoUrlPath!]]);

  return imageUrl;
}

export default useLogoImage;
