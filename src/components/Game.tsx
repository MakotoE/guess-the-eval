import React, {useEffect} from 'react';
import {calculateEval, submitAnswer, useAppDispatch, useAppSelector} from '../store';
import {Inputs} from './Inputs';
import {getTurn} from '../stockfish';
import {Layout} from './Layout';
import {questions} from '../questions';

export function Game(): React.ReactElement {
	const dispatch = useAppDispatch();
	const {currentQuestion, points} = useAppSelector(state => state.game);
	const evaluation = useAppSelector(state => state.stockfish.evaluation);
	const depth = useAppSelector(state => state.stockfish.currentDepth);

	let fen = '';
	let rightSide: React.ReactElement;
	if (currentQuestion < questions.length) {
		fen = questions[currentQuestion].fen;
		rightSide = <Inputs
			evaluationFinished={evaluation !== null}
			depth={depth}
			nextTurn={getTurn(fen)}
			onSubmit={answer => {dispatch(submitAnswer(answer))}}
		/>;
	} else {
		fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
		rightSide = <p>End of game</p>;
	}

	useEffect(() => {
		dispatch(calculateEval(fen));
	}, [dispatch, fen]);

	return <Layout fen={fen}>
		<p>Current points: {points}</p>
		{rightSide}
	</Layout>;
}
