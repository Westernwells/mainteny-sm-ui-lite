import {useState, useEffect} from 'react';

const useLogoDimensions = (imageUrl: string) => {
  const [logoDimensions, setLogoDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        if (isMounted) {
          let height;
          const aspectRatio = img.width / img.height;
          if (aspectRatio <= 1.3) {
            height = Math.min(80, 80 * (1 / aspectRatio));
          } else {
            height = Math.min(75, 150 * (1 / aspectRatio));
          }
          setLogoDimensions({width: img.width, height});
        }
      };
    }
    return () => {
      isMounted = false;
    };
  }, [imageUrl]);
  return logoDimensions;
};

export default useLogoDimensions;
