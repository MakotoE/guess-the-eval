import {Question} from './questions';
import {EvaluationAndBestMove} from './stockfish';

export function calculatePoints(
	question: Question,
	{evaluation, bestMoves}: EvaluationAndBestMove,
	answer: Answer
): number {
	return 1;
}

export interface Answer {
	evaluation: number,
	bestMove: string,
	playerTournament: string,
}
