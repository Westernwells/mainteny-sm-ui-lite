import {useState, useEffect} from 'react';
import {getBase64FromUrl, convertBase64ToPNG} from 'utils/utils';

const useMultiImagesURLToBase64 = (imageDownloadUrls: {
  [key: string]: string;
}) => {
  const [convertedImages, setConvertedImages] = useState<{
    [key: string]: string;
  }>({});
  const [isImageLoading, setIsImageLoading] = useState(false);

  const fetchAndConvertMultipleImages = async () => {
    try {
      setIsImageLoading(true);

      const keys = Object.keys(imageDownloadUrls);

      const promises = keys.map(async (path) => {
        const url = imageDownloadUrls[path];
        let base64 = await getBase64FromUrl(url);

        if (
          !base64?.startsWith('data:image/jpeg') &&
          !base64?.startsWith('data:image/png')
        ) {
          base64 = await convertBase64ToPNG(base64!);
        }

        return {base64, path};
      });

      const responses = await Promise.all(promises);

      const images = responses.reduce((acc, item) => {
        acc[item.path] = item.base64;

        return acc;
      }, {} as {[key: string]: string});

      setConvertedImages(images);
    } catch (error) {
      setConvertedImages({});
    } finally {
      setIsImageLoading(false);
    }
  };

  useEffect(() => {
    const shouldFetchImages = !!Object.keys(imageDownloadUrls).length;

    if (shouldFetchImages) {
      fetchAndConvertMultipleImages();
    }
  }, [imageDownloadUrls]);

  return {
    convertedImages,
    isImageLoading,
  };
};

export default useMultiImagesURLToBase64;
