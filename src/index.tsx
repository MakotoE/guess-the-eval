import ReactDOM from 'react-dom';
import React from 'react';
// import { Provider } from 'react-redux';
// import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import Game from './components/Game';
// import { store } from './store';
// import ErrorBoundary from './components/ErrorBoundary';
import StockfishOutput from './components/StockfishOutput';

// ReactDOM.render(
//   <ErrorBoundary>
//     <Provider store={store}>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Game />} />
//           <Route path="*" element={<p>Page not found</p>} />
//         </Routes>
//       </BrowserRouter>
//     </Provider>
//   </ErrorBoundary>,
//   document.getElementById('root'),
// );

ReactDOM.render(<StockfishOutput />, document.getElementById('root'));
