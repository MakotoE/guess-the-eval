import React, {useEffect} from 'react';
import {calculateEval, useAppDispatch, useAppSelector} from '../store';
import {Inputs} from './Inputs';
import {getTurn} from '../stockfish';
import {Layout} from './Layout';
import {useParams} from 'react-router-dom';

export function Game(): React.ReactElement {
	const {id} = useParams();
	const dispatch = useAppDispatch();
	const evaluation = useAppSelector(state => state.stockfish.evaluation);
	const depth = useAppSelector(state => state.stockfish.currentDepth);

	const fen = '3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27';

	useEffect(() => {
		dispatch(calculateEval(fen));
	}, [dispatch]);

	return <Layout fen={fen}>
		<Inputs
			evaluationFinished={evaluation !== null}
			depth={depth}
			nextTurn={getTurn(fen)}
			onSubmit={(d) => console.log(d)}
		/>
	</Layout>;
}
