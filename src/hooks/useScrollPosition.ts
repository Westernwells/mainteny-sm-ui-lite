import {useEffect, useMemo, useState} from 'react';

const SCROLL_PX_BUFFER = 4;

export const useScrollHorizontalPosition = (element: HTMLElement | null) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const isAtStart = useMemo(() => {
    if (element === null) return false;
    return scrollPosition < SCROLL_PX_BUFFER;
  }, [scrollPosition, element]);

  const isAtEnd = useMemo(() => {
    if (element === null) return false;
    return (
      scrollPosition + element.clientWidth >=
      element.scrollWidth - SCROLL_PX_BUFFER
    );
  }, [scrollPosition, element]);

  const handleScroll = () => {
    const position = element?.scrollLeft;
    setScrollPosition(position ?? 0);
  };

  const isScrollableX = useMemo(() => {
    if (element === null) return false;
    // Compare the height to see if the element has scrollable content
    const hasScrollableContent = element.scrollWidth > element.clientWidth;

    // It's not enough because the element's `overflow-y` style can be set as
    // * `hidden`
    // * `hidden !important`
    // In those cases, the scrollbar isn't shown
    const overflowYStyle = window.getComputedStyle(element).overflowY;
    const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;

    return hasScrollableContent && !isOverflowHidden;
  }, [element]);

  useEffect(() => {
    // Attach the scroll event listener
    if (element) {
      element.addEventListener('scroll', handleScroll);
    }

    // Cleanup event listener on component unmount
    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      }
    };
  }, [element]);

  return {
    scrollPosition,
    isAtStart,
    isAtEnd,
    isScrollableX,
  };
};
