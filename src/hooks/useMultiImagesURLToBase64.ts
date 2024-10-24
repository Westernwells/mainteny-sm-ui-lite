import {useState, useEffect} from 'react';
import {getBase64FromUrl, convertBase64ToPNG} from 'utils/utils';

interface Option {
  enabled?: boolean;
}

interface DownloadURLs {
  [key: string]: string;
}

const useMultiImagesURLToBase64 = (
  imageDownloadUrls: DownloadURLs,
  options?: Option,
) => {
  const {enabled = true} = options ?? {};

  const [convertedImages, setConvertedImages] = useState<{
    [key: string]: string;
  }>({});
  const [isImageLoading, setIsImageLoading] = useState(false);

  const fetchAndConvertMultipleImages = async (urls: DownloadURLs) => {
    try {
      setIsImageLoading(true);

      const keys = Object.keys(urls);

      const promises = keys.map(async (path) => {
        const url = urls[path];
        let base64 = await getBase64FromUrl(url);

        if (
          !base64?.startsWith('data:image/jpeg') &&
          !base64?.startsWith('data:image/png')
        ) {
          base64 = await convertBase64ToPNG(base64!);
        }

        return {base64, path};
      });

      const responses = await Promise.allSettled(promises);

      const images = responses.reduce((acc, item) => {
        if (item.status === 'fulfilled') {
          acc[item.value.path] = item.value.base64;
        }

        return acc;
      }, {} as {[key: string]: string});

      setConvertedImages(images);

      return images;
    } catch (error) {
      setConvertedImages({});
      return {};
    } finally {
      setIsImageLoading(false);
    }
  };

  const refetch = (downloadUrls?: DownloadURLs) =>
    fetchAndConvertMultipleImages(downloadUrls || imageDownloadUrls);

  useEffect(() => {
    const shouldFetchImages = !!Object.keys(imageDownloadUrls).length;

    if (shouldFetchImages && enabled) {
      fetchAndConvertMultipleImages(imageDownloadUrls);
    }
  }, [imageDownloadUrls, enabled]);

  return {
    convertedImages,
    isImageLoading,
    refetch,
  };
};

export default useMultiImagesURLToBase64;
