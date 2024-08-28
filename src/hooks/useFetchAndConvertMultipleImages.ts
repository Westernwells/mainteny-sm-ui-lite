import {ServiceOrderReportAttachmentView} from 'models/service-order';
import {useState, useEffect} from 'react';
import {getBase64FromUrl, convertBase64ToPNG} from 'utils/utils';

const useFetchAndConvertMultipleImages = (
  imageDownloadUrls: {[key: string]: string},
  attachments?: ServiceOrderReportAttachmentView[],
) => {
  const [convertedImages, setConvertedImages] = useState<string[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [shouldFetchImages, setShouldFetchImages] = useState(false);

  const fetchAndConvertMultipleImages = async () => {
    setIsImageLoading(true);
    try {
      const fetchedImages: (string | null)[] = await Promise.all(
        (attachments || []).map(async (attachment) => {
          if (attachment.fileResource && attachment.fileResource.uri) {
            const downloadUrl = imageDownloadUrls[attachment.fileResource.uri];
            if (downloadUrl) {
              const fetchedImageUrl = await getBase64FromUrl(downloadUrl);
              if (
                fetchedImageUrl &&
                fetchedImageUrl &&
                !fetchedImageUrl.startsWith('data:image/jpeg') &&
                !fetchedImageUrl.startsWith('data:image/png')
              ) {
                try {
                  return await convertBase64ToPNG(fetchedImageUrl);
                } catch (error) {
                  console.error('Error converting JPEG to PNG:', error);
                  return null;
                }
              } else {
                return fetchedImageUrl;
              }
            }
          }
          return null;
        }),
      );
      setConvertedImages(
        fetchedImages.filter((image) => image !== null) as string[],
      );
    } catch (error) {
      console.error('Error fetching and converting images:', error);
      setConvertedImages([]);
    } finally {
      setIsImageLoading(false);
    }
  };

  useEffect(() => {
    if (shouldFetchImages) {
      fetchAndConvertMultipleImages();
    }
  }, [shouldFetchImages]);

  return {
    convertedImages,
    isImageLoading,
    setShouldFetchImages,
    shouldFetchImages,
  };
};

export default useFetchAndConvertMultipleImages;
