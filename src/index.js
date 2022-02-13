import React from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Theme from './Theme.js';

ReactDOM.render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={Theme}>
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
