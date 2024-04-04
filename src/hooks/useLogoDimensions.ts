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
          const aspectRatio = img.width / img.height;
          let height;
          if (aspectRatio <= 1.3) {
            height = 90;
          } else if (aspectRatio <= 2.3) {
            height = img.width > 400 ? 80 : 35;
          } else {
            height = 35;
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
