import {Question} from './questions';
import {EvaluationAndBestMove} from './stockfish';

export class QuestionResult {
	public readonly question: Question;
	public readonly stockfishEval: EvaluationAndBestMove;
	public readonly answer: Answer;

	constructor(question: Question, stockfishEval: EvaluationAndBestMove, answer: Answer) {
		this.question = question;
		this.stockfishEval = stockfishEval;
		this.answer = answer;
	}

	/**
	 * 1. 20 points for correctly guessing the winning side or that the position is a draw
	 */
	foundWinningSide(): boolean {
		return this.answer.evaluation * this.stockfishEval.evaluation > 0;
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
		return -16 * Math.abs(this.answer.evaluation - this.stockfishEval.evaluation) + 50;
	}

	/**
	 * Returns nth best move, or null if best move was not found.
	 */
	foundBestMove(): number | null {
		const bestMoveIndex = this.stockfishEval.bestMoves.indexOf(this.answer.bestMove);
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
		for (const s of [this.question.players.white, this.question.players.black, this.question.tournament]) {
			for (const word of s.split(' ')) {
				possibleWords.add(word);
			}
		}

		for (const word of this.answer.playerOrTournament.split(' ')) {
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
