import React, {useContext, useRef} from 'react';
import {t} from 'i18next';
import {LanguageContext} from 'context/LanguageProvider';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import HelpIcon from '../assets/icons/HelpIcon.svg';

type KalasarInstance = {
  destroy(): void;
  isVisible(): boolean;
  toggle(): void;
};

export type WidgetOptions = {
  app_id: string;
  version_id: string;
  lang?: 'en' | 'de';
  user?: {id: string};
};

declare global {
  interface Window {
    Kalasar?: {
      startTour(options: WidgetOptions): KalasarInstance;
      closeWidget(): void;
    };
  }
}

const KalasarWidget: React.FC = () => {
  const instanceRef = useRef<KalasarInstance | null>(null);
  const {language} = useContext(LanguageContext);
  const {user} = useUserSession();

  const config: WidgetOptions = {
    app_id: import.meta.env.VITE_KALASAR_APP_ID!,
    version_id: import.meta.env.VITE_KALASAR_VERSION_ID!,
    lang: language?.toLowerCase().startsWith('de') ? 'de' : 'en',
    user: {id: user?.userAccount.id ?? 'anonymous'},
  };

  const handleClick = () => {
    if (!window.Kalasar) return;
    if (instanceRef.current) {
      instanceRef.current.toggle();
    } else {
      instanceRef.current = window.Kalasar.startTour(config);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: 'transparent',
      }}>
      <img
        src={HelpIcon}
        alt="Help Icon"
        style={{width: 25, height: 25, objectFit: 'contain', display: 'block'}}
      />
      <span
        style={{
          marginLeft: 8,
          fontSize: 15,
          fontFamily: 'Aventa, sans-serif',
          fontWeight: 600,
          lineHeight: '24.9px',
          letterSpacing: '0.14px',
          color: '#000034',
          height: 37,
          display: 'flex',
          alignItems: 'center',
        }}>
        {t('Help')}
      </span>
    </button>
  );
};

export default KalasarWidget;
