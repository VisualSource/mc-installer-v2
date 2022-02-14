import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import {createTheme, ThemeProvider} from '@mui/material/styles';
import { BrowserRouter } from "react-router-dom";
import {RecoilRoot} from 'recoil';
import App from './components/App';

import reportWebVitals from './reportWebVitals';
import { ReactQueryDevtools } from "react-query/devtools";

import "./index.sass";

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    mode: "dark"
  }
});

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
        <ThemeProvider theme={theme}>
            <BrowserRouter>
              <QueryClientProvider client={queryClient}>
                <App/>
                <ReactQueryDevtools initialIsOpen position="bottom-right" />
              </QueryClientProvider>
            </BrowserRouter>
        </ThemeProvider>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
