import ReactDOM from 'react-dom';
import React from 'react';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary';
// eslint-disable-next-line import/no-relative-packages
import '../semantic/semantic.less';

ReactDOM.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById('root'),
);
