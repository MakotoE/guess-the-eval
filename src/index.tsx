import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import Game from './components/Game';
import { store } from './store';
import ErrorBoundary from './components/ErrorBoundary';
import StockfishOutput from './components/StockfishOutput';

ReactDOM.render(
  <ErrorBoundary>
    <Provider store={store}>
      <Game />
    </Provider>
  </ErrorBoundary>,
  document.getElementById('root'),
);

// Uncomment to get Stockfish output
// ReactDOM.render(<StockfishOutput />, document.getElementById('root'));
