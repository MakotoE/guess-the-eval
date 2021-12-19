import {Question} from './questions';
import {EvaluationAndBestMove} from './stockfish';

export function calculatePoints(
	question: Question,
	stockfish: EvaluationAndBestMove,
	answer: Answer
): number {
	let points = 0;

	// 1. 20 points for correctly guessing the winning side or that the position is a draw
	if (answer.evaluation * stockfish.evaluation > 0) {
		points += 10;
	}

	// 2. The number of points for the eval guess is given by -16 |guess - actual_eval| + 50
	// (guess - actual_eval) vs points awarded table
	// 0: 50
	// 0.5: 42
	// 1: 34
	// 2: 18
	// 3: 2
	// 4: -14
	// 5: -30
	// 6: -46
	// 10: -110

	points += -16 * Math.abs(answer.evaluation - stockfish.evaluation) + 50;

	return points;
}

export interface Answer {
	evaluation: number,
	bestMove: string,
	playerTournament: string,
}
