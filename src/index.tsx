import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import { BrowserRouter } from "react-router-dom";
import {RecoilRoot} from 'recoil';
import App from './components/App';

import "./index.sass";

const theme = createTheme({
  palette: {
    mode: "dark"
  }
});

/*
window._db = new DB();
window._downloads = new Download();
let _ = new Account();
*/

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </ThemeProvider>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
