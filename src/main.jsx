import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { legacyRedirect } from './lib/route.js';

// Links shared before the site had sections (`/?net=…&step=…`) open the
// same place in the Flows explorer.
const legacy = legacyRedirect(window.location.search, window.location.hash);
if (legacy) window.history.replaceState(null, '', `${window.location.pathname}${legacy}`);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
