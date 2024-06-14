import {useState, useEffect} from 'react';
import {getBase64FromUrl, convertBase64ToPNG} from 'utils/utils';

const useFetchAndConvertImage = (downloadUrl: string) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchImages = async () => {
      if (downloadUrl) {
        try {
          const fetchedImageUrl = await getBase64FromUrl(downloadUrl);
          if (isMounted && fetchedImageUrl) {
            let finalImageUrl = fetchedImageUrl;
            if (fetchedImageUrl.startsWith('data:image/jpeg')) {
              try {
                finalImageUrl = await convertBase64ToPNG(fetchedImageUrl);
              } catch (error) {
                console.error('Error converting JPEG to PNG:', error);
              }
            }
            setImageUrl(finalImageUrl);
          }
        } catch (error) {
          console.error('Error fetching image:', error);
        }
      }
    };

    fetchImages();

    return () => {
      isMounted = false;
    };
  }, [downloadUrl]);

  return imageUrl;
};

export default useFetchAndConvertImage;
