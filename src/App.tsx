import {BrowserRouter} from 'react-router-dom';
import {Router} from 'routes';
import './styles.css';
import './i18n';

export const App = () => (
  <BrowserRouter>
    <Router />
  </BrowserRouter>
);
