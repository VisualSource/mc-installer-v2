import React from 'react';
import ReactDOM from 'react-dom';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import { BrowserRouter } from "react-router-dom";
import reportWebVitals from './reportWebVitals';

import App from './components/base/App';
import './index.css';

const theme = createTheme({
  palette: {
    mode: "dark"
  }
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App/>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
