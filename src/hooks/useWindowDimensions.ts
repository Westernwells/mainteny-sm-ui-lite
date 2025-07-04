import {useState, useEffect} from 'react';

const useWindowDimensions = () => {
  const [innerHeight, setInnerHeight] = useState(window.innerHeight);
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setInnerHeight(window.innerHeight);
      setInnerWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {innerHeight, innerWidth};
};

export default useWindowDimensions;
