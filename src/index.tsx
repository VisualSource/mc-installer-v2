import React from 'react';
import ReactDOM from 'react-dom';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import { BrowserRouter } from "react-router-dom";
import {RecoilRoot} from 'recoil';
import reportWebVitals from './reportWebVitals';
import DB from './core/db';
import Download from './core/downloads';
import Account from './core/accounts';
import App from './components/base/App';
import "./index.sass";
import './index.css';

window._db = new DB();
window._downloads = new Download();
let _ = new Account();

const theme = createTheme({
  palette: {
    mode: "dark"
  }
});

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <App/>
        </ThemeProvider>
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
