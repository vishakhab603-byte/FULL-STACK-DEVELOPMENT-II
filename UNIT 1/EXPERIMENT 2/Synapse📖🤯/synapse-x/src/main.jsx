import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './index.css';

// A little something for anyone who opens the console. Hi. 🧠
if (typeof window !== 'undefined') {
  console.log(
    '%c' +
      ' ____  _   ___  __    _    ____  ____  _____   __\n' +
      '/ ___|| \\ | \\ \\/ /   / \\  |  _ \\/ ___|| ____| \\ \\ \n' +
      '\\___ \\|  \\| |\\  /   / _ \\ | |_) \\___ \\|  _|    \\ \\ \n' +
      ' ___) | |\\  |/  \\  / ___ \\|  __/ ___) | |___   / /\n' +
      '|____/|_| \\_/_/\\_\\/_/   \\_\\_|   |____/|_____| /_/ \n',
    'color:#8a6bff;font-family:monospace;font-size:11px;'
  );
  console.log('%cOne brain. Infinite state.', 'color:#00b8d9;font-weight:bold;font-size:13px;');
  console.log(
    '%cPsst — try the Konami code (↑↑↓↓←→←→BA), click the sidebar logo 7 times fast, or type "party" into the command palette (Ctrl/Cmd+K).',
    'color:#888;font-style:italic;'
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
