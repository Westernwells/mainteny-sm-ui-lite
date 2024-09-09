import React, {useRef, useEffect} from 'react';
import HelpIcon from '../assets/icons/HelpIcon.svg';

// Extend the Window interface to include Kalasar
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

// Define the props for KalasarSearch
interface KalasarSearchProps {
  app_id: string;
  version_id: string;
  url: string;
  user_id: string;
  lang: string;
  scrolling: boolean;
  heading: string;
  description: string;
  suggestions: string[];
  searchBarVisible: boolean;
}

interface KalasarSearchInstance {
  destroy: () => void;
}

const KalasarSearchComponent: React.FC = () => {
  const kalasarInstanceRef = useRef<KalasarSearchInstance | null>(null);

  useEffect(
    () => () => {
      if (kalasarInstanceRef.current) {
        kalasarInstanceRef.current.destroy();
      }
    },
    [],
  );

  const openKalasarSearchModal = () => {
    if (kalasarInstanceRef.current) {
      kalasarInstanceRef.current.destroy();
    }

    const props: KalasarSearchProps = {
      app_id: 'd6bfd7f4-39a0-4824-8720-a8b79d32f586',
      version_id: '3c8deb5a-a9be-4c8e-a839-a17c9dd367a7',
      url: 'https://design.kalasar.com/api/v1/product_tour_request',
      user_id: '2',
      lang: 'de',
      scrolling: true,
      searchBarVisible: true,
      heading: 'Top Fragen von Mainteny Kunden',
      suggestions: ['Neuen Kunden anlegen', 'Bestehenden Kunden bearbeiten'],
      description:
        'Unser KI Assistent wird Sie Schritt für Schritt durch die Prozesse führen',
    };

    if (window.Kalasar && window.Kalasar.KalasarSearch) {
      kalasarInstanceRef.current = new window.Kalasar.KalasarSearch({
        target: document.body,
        props,
      });
    } else {
      console.error(
        'Kalasar.KalasarSearch is not available on the window object',
      );
    }
  };

  return (
    <button
      type="button"
      onClick={openKalasarSearchModal}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '4px',
      }}>
      {/* Help Icon */}
      <img
        src={HelpIcon}
        alt="Help Icon"
        style={{
          width: '25px',
          height: '25px',
          display: 'block',
          objectFit: 'contain',
        }}
      />
      {/* Help Text */}
      <span
        style={{
          marginLeft: '8px',
          fontSize: '15px',
          fontFamily: 'Aventa, sans-serif',
          fontWeight: 600,
          lineHeight: '24.9px',
          letterSpacing: '0.14px',
          color: '#000034',
          height: '37px',
          display: 'flex',
          alignItems: 'center',
        }}>
        Help
      </span>
    </button>
  );
};

export default KalasarSearchComponent;
