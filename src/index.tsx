import ReactDOM from 'react-dom';
import React from 'react';
import {Game} from './components/Game';
import {Provider} from 'react-redux';
import {store} from './store';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {ErrorBoundary} from './components/ErrorBoundary';

ReactDOM.render(
	<ErrorBoundary>
		<Provider store={store}>
			<BrowserRouter>
				<Routes>
					<Route path='/' element={<Game />} />
					<Route path='*' element={<p>Page not found</p>} />
				</Routes>
			</BrowserRouter>
		</Provider>
	</ErrorBoundary>,
	document.getElementById('root'),
);
