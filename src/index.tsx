import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import App from './components/App';
import { store } from './store';
import ErrorBoundary from './components/ErrorBoundary';
// eslint-disable-next-line import/no-relative-packages
import '../semantic/semantic.less';

ReactDOM.render(
  <ErrorBoundary>
    <Provider store={store}>
      <App />
    </Provider>
  </ErrorBoundary>,
  document.getElementById('root'),
);
