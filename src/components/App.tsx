import React, {useEffect} from 'react';
import Chessground from '../chessground';
import {calculateEval, useAppDispatch, useAppSelector} from '../store';
import {Config} from 'chessground/config';
import {Grid} from 'semantic-ui-react';
import {Inputs} from './Inputs';
import {getTurn} from '../stockfish';
import {BrowserRouter, Route, Routes, Outlet} from 'react-router-dom';

interface LayoutProps {
	fen: string;
}

function Layout({fen}: LayoutProps): React.ReactElement {
	const boardConfig: Config = {fen};

	return <Grid centered>
		<Grid.Row>
			<Grid.Column width={2} style={{minWidth: '440px'}}>
				<Chessground config={boardConfig} width={400} height={400} />
			</Grid.Column>
			<Grid.Column width={1} style={{minWidth: '400px'}}>
				<Outlet />
			</Grid.Column>
		</Grid.Row>
	</Grid>;
}

export function App(): React.ReactElement {
	const dispatch = useAppDispatch();
	const evaluation = useAppSelector(state => state.stockfish.evaluation);
	const depth = useAppSelector(state => state.stockfish.currentDepth);

	const fen = '3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27';

	useEffect(() => {
		dispatch(calculateEval(fen));
	}, [dispatch]);

	const inputs = <Inputs
		evaluationFinished={evaluation !== null}
		depth={depth}
		nextTurn={getTurn(fen)}
		onSubmit={(d) => console.log(d)}
	/>;

	return <BrowserRouter>
		<Routes>
			<Route path='/' element={<Layout fen={fen} />}>
				<Route index element={inputs} />
				<Route path='*' element={<p>Not found</p>} />
			</Route>
		</Routes>
	</BrowserRouter>;
}
