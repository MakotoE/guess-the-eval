import {Question} from './questions';

export function calculatePoints(question: Question, answer: Answer): number {
	return 1;
}

export interface Answer {
	evaluation: number,
	bestMove: string,
	playerTournament: string,
}
