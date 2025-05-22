import {useEffect, useRef, useState} from 'react';

type Props = {
  elementRef: HTMLDivElement | null;
  itemCount: number;
  isOpen: boolean;
  initialIndex: number;
  circular?: boolean;
  onSelect: (index: number, e: KeyboardEvent) => void;
  onClose: () => void;
  // onFocus?: () => void; // placeholder
};

function useKeyboardNavigationControls<T extends HTMLElement = HTMLElement>({
  elementRef,
  itemCount,
  isOpen,
  initialIndex = 0,
  circular = true,
  onSelect,
  onClose,
}: Props) {
  // State to track the currently selected index
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  // Refs to store item elements for scrolling into view
  const itemRefs = useRef<(T | null)[]>([]);

  const moveUp = () => {
    if (circular) {
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : itemCount - 1,
      );
    } else {
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex,
      );
    }
  };

  const moveDown = () => {
    if (circular) {
      setSelectedIndex((prevIndex) =>
        prevIndex < itemCount - 1 ? prevIndex + 1 : 0,
      );
    } else {
      setSelectedIndex((prevIndex) =>
        prevIndex < itemCount - 1 ? prevIndex + 1 : prevIndex,
      );
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        moveUp();
        break;
      case 'ArrowDown':
        event.preventDefault();
        moveDown();
        break;
      case 'Enter':
        // is not detected
        // Enter can also be represented as keyCode 13
        event.preventDefault();
        onSelect(selectedIndex, event);
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  };

  // Reset selected index when menu opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Add keyboard event listener
  useEffect(() => {
    elementRef?.addEventListener('keydown', handleKeyDown);

    return elementRef?.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, isOpen]);

  // Effect to scroll selected item into view
  useEffect(() => {
    if (isOpen && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex].focus();
      itemRefs.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex, isOpen]);

  return {
    selectedIndex,
    itemRefs,
    setSelectedIndex,
    moveUp,
    moveDown,
  };
}

export default useKeyboardNavigationControls;
