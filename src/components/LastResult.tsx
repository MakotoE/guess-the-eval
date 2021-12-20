import React from 'react';
import {Container} from 'semantic-ui-react';
import {QuestionResult} from '../calculatePoints';

interface Props {
	lastResult: QuestionResult;
}

export function LastResult({lastResult}: Props): React.ReactElement {
	return <Container>
		{
			lastResult.foundWinningSide()
				? 'You guessed the winning side. +20 points'
				: 'You did not guess the winning side. +0 points'
		}
		<br />
		{`Your eval guess was off by ${Math.abs(lastResult.answer.evaluation - lastResult.stockfishEval.evaluation)}.`}
		<br />
		{`Actual eval was ${formatEval(lastResult.stockfishEval.evaluation)}.`}
		<br />
		{`${lastResult.evalPoints().toFixed(1)} points for the evaluation.`}
		<br />
		{
			lastResult.foundBestMove() === null
				? 'You did not find a best move.'
				: `You found the ${lastResult.foundBestMove() as number}th best move. Multiplier: x${lastResult.bestMoveMultiplier()}`
		}
		{
			// Multiplier was applied to a negative score
			lastResult.foundBestMove() !== null && lastResult.evalPoints() < 0
				? ' (OOOF!)'
				: ''
		}
		<br />
		{`These were the best moves according to Stockfish: ${JSON.stringify(lastResult.stockfishEval.bestMoves)}`}
		<br />
		{
			lastResult.foundPlayerOrTournament()
				? 'You guessed one of the players or the tournament. +10 points'
				: 'You did not guess a player or the tournament.'
		}
		<br />
		{`That was a match between ${lastResult.question.players.white} (white) and ${lastResult.question.players.black} (black). It was played at the ${lastResult.question.tournament}.`}
		<br />
		{`You earned ${lastResult.totalPoints().toFixed(1)} points.`}
	</Container>;
}

function formatEval(evaluation: number): string {
	const sign = evaluation > 0 ? '+' : '';
	return sign + evaluation.toFixed(2);
}
