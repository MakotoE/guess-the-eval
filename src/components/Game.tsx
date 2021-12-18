import React, {useEffect} from 'react';
import {calculateEval, useAppDispatch, useAppSelector} from '../store';
import {Inputs} from './Inputs';
import {getTurn} from '../stockfish';
import {Layout} from './Layout';
import {useParams} from 'react-router-dom';
import {questions} from '../questions';

export function Game(): React.ReactElement {
	const params = useParams();
	const id = parseInt(params.id as string);
	const dispatch = useAppDispatch();
	const evaluation = useAppSelector(state => state.stockfish.evaluation);
	const depth = useAppSelector(state => state.stockfish.currentDepth);

	const fen = questions[id].fen;

	useEffect(() => {
		dispatch(calculateEval(fen));
	}, [dispatch, fen]);

	return <Layout fen={fen}>
		<Inputs
			evaluationFinished={evaluation !== null}
			depth={depth}
			nextTurn={getTurn(fen)}
			onSubmit={(d) => console.log(d)}
		/>
	</Layout>;
}
