import React from 'react';
import {Container} from 'semantic-ui-react';
import {PointsSolver} from '../PointsSolver';

interface Props {
	points: PointsSolver;
}

export function LastResult({points}: Props): React.ReactElement {
	return <Container>
		{
			points.foundWinningSide()
				? 'You guessed the winning side. +20 points'
				: 'You did not guess the winning side. +0 points'
		}
		<br />
		{`Your eval guess was off by ${Math.abs(points.result.answer.evaluation - points.result.stockfishEval.evaluation)}. Actual eval was ${formatEval(points.result.stockfishEval.evaluation)}.`}
		<br />
		{`${points.evalPoints().toFixed(1)} points for the evaluation.`}
		<br />
		{
			points.foundBestMove() === null
				? 'You did not find a best move.'
				: `You found the ${points.foundBestMove() as number}th best move. Multiplier: x${points.bestMoveMultiplier()}`
		}
		{
			// Multiplier was applied to a negative score
			points.foundBestMove() !== null && points.evalPoints() < 0
				? ' (OOOF!)'
				: ''
		}
		<br />
		{`These were the best moves according to Stockfish: ${points.result.stockfishEval.bestMoves[0]}, ${points.result.stockfishEval.bestMoves[1]}, ${points.result.stockfishEval.bestMoves[2]}.`}
		<br />
		{
			points.foundPlayerOrTournament()
				? 'You guessed one of the players or the tournament. +10 points'
				: 'You did not guess a player or the tournament.'
		}
		<br />
		{`This was a game between ${points.result.question.players.white} (white) and ${points.result.question.players.black} (black). It was played at the ${points.result.question.tournament}.`}
		{/* TODO show source */}
		<br />
		{`You earned ${points.totalPoints().toFixed(1)} points.`}
	</Container>;
}

function formatEval(evaluation: number): string {
	const sign = evaluation > 0 ? '+' : '';
	return sign + evaluation.toFixed(2);
}
