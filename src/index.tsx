import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';

import './styles/index.css';
import DappProviderWagmi2Container from './containers/DappProviderWagmi2Container';
import reportWebVitals from './reportWebVitals';
import store, { persistor } from './state';
import queryClient from './utils/queryClient';

const PGate = PersistGate as any;

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PGate
          loading={null}
          persistor={persistor}
        >
          <DappProviderWagmi2Container />
        </PGate>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();