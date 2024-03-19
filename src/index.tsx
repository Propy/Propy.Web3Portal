import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/es/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';

import './styles/index.css';
import DappProviderWagmiContainer from './containers/DappProviderWagmiContainer';
import reportWebVitals from './reportWebVitals';
import store, { persistor } from './state';
import queryClient from './utils/queryClient';

const PGate = PersistGate as any;

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PGate
          loading={null}
          persistor={persistor}
        >
          <DappProviderWagmiContainer />
        </PGate>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();