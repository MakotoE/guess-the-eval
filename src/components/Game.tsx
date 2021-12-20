import React, {useEffect, useState} from 'react';
import {calculateEval, submitAnswer, useAppDispatch, useAppSelector} from '../store';
import {Inputs} from './Inputs';
import {getTurn} from '../stockfish';
import {Layout} from './Layout';
import {questions} from '../questions';
import {Chess} from 'chess.ts';
import {Container} from 'semantic-ui-react';

export function Game(): React.ReactElement {
	const dispatch = useAppDispatch();
	const {currentQuestion, points, evaluation, currentDepth, lastResult} = useAppSelector(state => state.game);
	const [showAnswer, setShowAnswer] = useState(false);

	let fen = '';
	let rightSide: React.ReactElement;
	if (showAnswer) {
		if (lastResult === null) {
			throw new Error('lastResult is null');
		}
		rightSide = <Container>
			{
				lastResult.foundWinningSide()
					? 'You guessed the winning side. +20 points'
					: 'You did not guess the winning side. +0 points'
			}
			<br />
			{`Your eval guess was off by ${Math.abs(lastResult.answer.evaluation - lastResult.stockfishEval.evaluation)}.`}
			<br />
			{`${lastResult.evalPoints()} points`}
			<br />
			{`Actual eval was ${formatEval(lastResult.stockfishEval.evaluation)}.`}
			<br />
			{
				lastResult.foundBestMove() === null
					? 'You did not find a best move.'
					: `You found the ${lastResult.foundBestMove() as number}th best move. Multiplier: x${lastResult.bestMoveMultiplier()}`
			}
			<br />
			{
				lastResult.foundBestMove() !== null && lastResult.evalPoints() < 0
					? '(OOOF!)'
					: ''
			}
			<br />
			{`These were the best moves according to Stockfish: ${JSON.stringify(lastResult.stockfishEval.bestMoves)}`}
			<br />
			{
				lastResult.foundPlayerOrTournament()
					? 'You guessed one of the players or the tournament. +10 points'
					: ''
			}
			<br />
			{`That was a match between ${lastResult.question.players.white} (white) and ${lastResult.question.players.black} (black).`}
			<br />
			{`It was played at the ${lastResult.question.tournament}.`}
			<br />
			{`You earned ${lastResult.totalPoints()} points.`}
		</Container>;
	} else if (currentQuestion < questions.length) {
		fen = questions[currentQuestion].fen;
		rightSide = <Inputs
			evaluationFinished={evaluation !== null}
			depth={currentDepth}
			nextTurn={getTurn(fen)}
			onSubmit={answer => {
				dispatch(submitAnswer(answer));
				setShowAnswer(true);
			}}
		/>;
	} else {
		fen = new Chess().fen();
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

function formatEval(evaluation: number): string {
	const sign = evaluation > 0 ? '+' : '';
	return sign + evaluation.toFixed(2);
}
