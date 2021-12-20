import {Question} from './questions';
import {EvaluationAndBestMove} from './stockfish';

export interface QuestionResult {
	question: Question;
	stockfishEval: EvaluationAndBestMove;
	answer: Answer;
}

export class PointsSolver {
	public readonly result: QuestionResult;

	constructor(result: QuestionResult) {
		this.result = result;
	}

	/**
	 * 1. 20 points for correctly guessing the winning side or that the position is a draw
	 */
	foundWinningSide(): boolean {
		return this.result.answer.evaluation * this.result.stockfishEval.evaluation > 0;
	}

	/**
	 * 2. The number of points for the eval guess is given by -16 |guess - actual_eval| + 50
	 * Eval difference vs points awarded table
	 * 0: 50
	 * 0.5: 42
	 * 1: 34
	 * 2: 18
	 * 3: 2
	 * 4: -14
	 * 5: -30
	 * 6: -46
	 * 10: -110
	 */
	evalPoints(): number {
		return -16 * Math.abs(this.result.answer.evaluation - this.result.stockfishEval.evaluation) + 50;
	}

	/**
	 * Returns nth best move, or null if best move was not found.
	 */
	foundBestMove(): number | null {
		const bestMoveIndex = this.result.stockfishEval.bestMoves.indexOf(this.result.answer.bestMove);
		if (bestMoveIndex === -1) {
			return null;
		}
		return bestMoveIndex + 1;
	}

	/**
	 * 3. Guessing a best move multiplies your eval points by -0.5 (bestMoveNumber) + 4.5
	 * 0: x3.0, 1: x2.5, 2: x2.0
	 */
	bestMoveMultiplier(): number {
		const bestMove = this.foundBestMove();
		if (bestMove === null) {
			return 1;
		}
		return -0.5 * bestMove + 3;
	}

	/**
	 * 4. Guessing a player or the tournament awards 10 points
	 */
	foundPlayerOrTournament(): boolean {
		const possibleWords = new Set<string>();
		const strings = [
			this.result.question.players.white,
			this.result.question.players.black,
			this.result.question.tournament,
		];
		for (const s of strings) {
			for (const word of s.split(' ')) {
				possibleWords.add(word);
			}
		}

		for (const word of this.result.answer.playerOrTournament.split(' ')) {
			if (possibleWords.has(word)) {
				return true;
			}
		}

		return false;
	}

	totalPoints(): number {
		return (this.foundWinningSide() ? 20 : 0)
			+ this.evalPoints() * this.bestMoveMultiplier()
			+ (this.foundPlayerOrTournament() ? 10 : 0);
	}
}

export interface Answer {
	evaluation: number,
	bestMove: string,
	playerOrTournament: string,
}
