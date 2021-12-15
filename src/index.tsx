import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";
import YAML from 'yaml';

import reportWebVitals from './reportWebVitals';

import App from './components/App';
import ProfileManager from './core/ProfileManager';
import DownloadManager from './core/DownloadManager';
import Database from './core/Database';

import './index.css';

window.YAML = YAML;
window._db = new Database();
window._profiles = new ProfileManager();
window._downloads = new DownloadManager();

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
