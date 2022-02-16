import ReactDOM from 'react-dom';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './components/App';
import ErrorBoundary from './components/ErrorBoundary';
// eslint-disable-next-line import/no-relative-packages
import '../semantic/semantic.less';

ReactDOM.render(
  <ErrorBoundary>
    <BrowserRouter basename="/guess-the-eval">
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>,
  document.getElementById('root'),
);
