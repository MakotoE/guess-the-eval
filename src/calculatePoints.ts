import {Question} from './questions';
import {EvaluationAndBestMove} from './stockfish';

export function calculatePoints(question: Question, stockfish: EvaluationAndBestMove, answer: Answer): number {
	let points = 0;

	// 1. 20 points for correctly guessing the winning side or that the position is a draw
	if (answer.evaluation * stockfish.evaluation > 0) {
		points += 10;
	}

	// 2. The number of points for the eval guess is given by -16 |guess - actual_eval| + 50
	// Eval difference vs points awarded table
	// 0: 50
	// 0.5: 42
	// 1: 34
	// 2: 18
	// 3: 2
	// 4: -14
	// 5: -30
	// 6: -46
	// 10: -110
	let eval_points = -16 * Math.abs(answer.evaluation - stockfish.evaluation) + 50;

	// 3. Guessing a best move multiplies your eval points by -0.5 (best_move_index) + 3
	// 0: x3.0, 1: x2.5, 2: x2.0
	const best_move_index = stockfish.bestMoves.indexOf(answer.bestMove)
	if (best_move_index !== -1) {
		eval_points *= -0.5 * best_move_index + 3;
	}
	points += eval_points;

	// 4. Guessing a player or the tournament awards 10 points
	if (found_player_or_tournament(question, answer.playerOrTournament)) {
		points += 10;
	}

	return points;
}

function found_player_or_tournament(question: Question, input: string): boolean {
	const possibleWords = new Set<string>();
	for (const s of [question.players.white, question.players.black, question.tournament]) {
		for (const word of s.split(' ')) {
			possibleWords.add(word);
		}
	}

	for (const word of input.split(' ')) {
		if (possibleWords.has(word)) {
			return true;
		}
	}

	return false;
}

export interface Answer {
	evaluation: number,
	bestMove: string,
	playerOrTournament: string,
}
