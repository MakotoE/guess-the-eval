import ReactDOM from 'react-dom';
import React from 'react';
import {Game} from './components/Game';
import {Provider} from 'react-redux';
import {store} from './store';
import {BrowserRouter, Route, Routes} from 'react-router-dom';

ReactDOM.render(
	<Provider store={store}>
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<p>index</p>} />
				<Route path='/game' element={<Game />} />
				<Route path='*' element={<p>Page not found</p>} />
			</Routes>
		</BrowserRouter>
	</Provider>,
	document.getElementById('root'),
);
