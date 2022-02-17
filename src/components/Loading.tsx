import {useRef} from 'react';
import {useIsFetching, useIsMutating} from 'react-query';
import LoadingBar, {LoadingBarRef} from 'react-top-loading-bar';

interface LoadingProps extends LoadingBarRef {
  continuousStart: (startingValue?: number, refreshRate?: number) => void;
}

export const Loading = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const ref = useRef<LoadingProps>(null);

  if (isFetching || isMutating) {
    ref.current!.continuousStart();
  } else if (ref.current) {
    ref.current.complete();
  }

  return <LoadingBar color="#222B45" ref={ref} />;
};
