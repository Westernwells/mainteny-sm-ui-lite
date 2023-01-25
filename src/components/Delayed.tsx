import {useState, useEffect} from 'react';
import {Progress} from 'components/Progress';

type Props = {
  children: JSX.Element;
  waitBeforeShow?: number;
  fallback?: JSX.Element;
};

const Delayed = ({
  children,
  waitBeforeShow = 500,
  fallback = <Progress />,
}: Props) => {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
    return () => clearTimeout(timer);
  }, [waitBeforeShow]);

  return isShown ? children : fallback;
};

export default Delayed;
