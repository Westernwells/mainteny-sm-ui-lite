import React, {useEffect} from 'react';
import {Router} from 'routes';
import {BrowserRouter} from 'react-router-dom';
import './styles.css';
import './i18n';

export const App: React.FC = () => {
  useEffect(() => {
    const ua = navigator.userAgent;
    const isIPadDesktop = /CriOS/.test(ua) && /Macintosh/.test(ua);

    if (isIPadDesktop) {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=1024');
      }

      document.documentElement.classList.add('ipad-desktop-mode');
    }
  }, []);

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
};
