import React, {useRef, useEffect} from 'react';

// Define the props for KalasarSearch
interface KalasarSearchProps {
  app_id: string;
  version_id: string;
  url: string;
  user_id: string;
  lang: string;
  heading: string;
  description: string;
  suggestions: string[];
}

// Define the shape of the KalasarSearch instance
interface KalasarSearchInstance {
  destroy: () => void;
}

// Declare the global Kalasar namespace
declare global {
  interface Window {
    Kalasar: {
      KalasarSearch: new (options: {
        target: Element;
        props: KalasarSearchProps;
      }) => KalasarSearchInstance;
    };
  }
}

const KalasarSearchComponent: React.FC = () => {
  const kalasarInstanceRef = useRef<KalasarSearchInstance | null>(null);

  useEffect(
    () => () => {
      // Cleanup function to destroy the instance when the component unmounts
      if (kalasarInstanceRef.current) {
        kalasarInstanceRef.current.destroy();
      }
    },
    [],
  );

  const openKalasarSearchModal = () => {
    if (kalasarInstanceRef.current) {
      // Destroy the previous instance
      kalasarInstanceRef.current.destroy();
    }

    const props: KalasarSearchProps = {
      app_id: 'd6bfd7f4-39a0-4824-8720-a8b79d32f586',
      version_id: '3c8deb5a-a9be-4c8e-a839-a17c9dd367a7',
      url: 'https://design.kalasar.com/api/v1/product_tour_request',
      user_id: '2',
      lang: 'de',
      heading: 'Top Fragen von Mainteny Kunden',
      suggestions: ['Neuen Kunden anlegen', 'Bestehenden Kunden bearbeiten'],
      description:
        'Unser KI Assistent wird Sie Schritt für Schritt durch die Prozesse führen',
    };

    if (window.Kalasar && window.Kalasar.KalasarSearch) {
      kalasarInstanceRef.current = new window.Kalasar.KalasarSearch({
        target: document.body, // or any other DOM element
        props,
      });
    } else {
      console.error(
        'Kalasar.KalasarSearch is not available on the window object',
      );
    }
  };

  return (
    <button onClick={openKalasarSearchModal} type="button">
      Click me
    </button>
  );
};

export default KalasarSearchComponent;
