import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from 'react-redux';
import Game from './components/Game';
import { store } from './store';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.render(
  <ErrorBoundary>
    <Provider store={store}>
      <Game />
    </Provider>
  </ErrorBoundary>,
  document.getElementById('root'),
);

// Comment above and uncomment below to get Stockfish output
// import ReactDOM from 'react-dom';
// import React from 'react';
// import StockfishOutput from './components/StockfishOutput';
//
// ReactDOM.render(<StockfishOutput />, document.getElementById('root'));
