import {useState, useEffect} from 'react';

function useFakeProgress(
  status: 'error' | 'loading' | 'success' | 'idle',
): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (status === 'loading') {
      intervalId = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 99) {
            clearInterval(intervalId);
            return 100;
          }
          return prevProgress + 1;
        });
      }, 100);
    }
    return () => clearInterval(intervalId);
  }, [status]);

  return progress;
}

export default useFakeProgress;
