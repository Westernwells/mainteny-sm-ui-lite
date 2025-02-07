import {useEffect, useState} from 'react';
import {convertBase64ToPNG, getBase64FromUrl} from 'utils/utils';

export const fetchAndConvertImageToBase64 = async (url: string) => {
  try {
    const fetchedImageUrl = await getBase64FromUrl(url);
    if (fetchedImageUrl) {
      let finalImageUrl = fetchedImageUrl;
      if (fetchedImageUrl.startsWith('data:image/jpeg')) {
        try {
          finalImageUrl = await convertBase64ToPNG(fetchedImageUrl);
        } catch (error) {
          console.error('Error converting JPEG to PNG:', error);
        }
      }
      return finalImageUrl;
    }
  } catch (error) {
    console.error('Error fetching image:', error);
  }
  return '';
};

const useFetchAndConvertImage = (downloadUrl: string) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    setImageUrl(''); // reset image on downloadUrl change
    let isMounted = true;

    if (isMounted) {
      fetchAndConvertImageToBase64(downloadUrl).then((url) => {
        setImageUrl(url);
      });
    }

    return () => {
      isMounted = false;
    };
  }, [downloadUrl, fetchAndConvertImageToBase64]);

  return imageUrl;
};

export default useFetchAndConvertImage;
