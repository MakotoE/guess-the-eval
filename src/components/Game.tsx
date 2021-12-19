import React, {useEffect} from 'react';
import {calculateEval, useAppDispatch, useAppSelector} from '../store';
import {Inputs} from './Inputs';
import {getTurn} from '../stockfish';
import {Layout} from './Layout';
import {questions} from '../questions';

export function Game(): React.ReactElement {
	const dispatch = useAppDispatch();
	const currentQuestion = useAppSelector(state => state.game.currentQuestion);
	const evaluation = useAppSelector(state => state.stockfish.evaluation);
	const depth = useAppSelector(state => state.stockfish.currentDepth);

	const fen = questions[currentQuestion].fen;

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
