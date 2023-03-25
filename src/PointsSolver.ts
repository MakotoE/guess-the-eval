import { Question, Move, Moves } from './questions';

/**
 * Calculates points awarded for position.
 *
 * 1. 20 points for correctly guessing the winning side or that the position is a draw
 *
 * 2. The number of points for the eval guess is given by:
 * points = -8(1/abs(0.5c + 1))d^1.5 + 50
 * if points < 0: points = points / 4
 * where c = correct eval, d = abs(guessed eval - c)
 *
 * 3. Guessing a best move multiplies your eval points by:
 * multiplier = max(-0.75 * abs(guessed eval - c) + 3, 1)
 * if points > 0:
 *   1 / multiplier
 *
 * 4. Guessing a player awards 10 points
 */
export class PointsSolver {
  public readonly result: QuestionAnswer;

  constructor(result: QuestionAnswer) {
    this.result = result;
  }

  /**
   * @returns true if the winning side was found or correctly answering a draw
   */
  foundWinningSide(): boolean {
    if (
      this.result.answer.evaluation === 0
      && this.result.question.moves.one.evaluation === 0
    ) {
      return true;
    }

    return this.result.answer.evaluation * this.result.question.moves.one.evaluation >= 0;
  }

  /**
   * @returns Points awarded for eval
   */
  evalPoints(): number {
    const correctEval = this.result.question.moves.one.evaluation;
    const guessEval = this.result.answer.evaluation;
    const unadjusted = -8 * (1 / Math.abs(0.5 * correctEval + 1))
      * Math.abs(guessEval - correctEval) ** 1.5
      + 50;
    if (unadjusted < 0) {
      return unadjusted / 2;
    }
    return unadjusted;
  }

  /**
   * @returns true if guessed move was in the top 3
   */
  foundBestMove(): boolean {
    const variation = PointsSolver.getMatchingVariation(
      this.result.question.moves,
      this.result.answer.bestMove,
    );
    return variation !== null;
  }

  /**
   * @returns Eval points multiplier
   */
  bestMoveMultiplier(): number {
    const variation = PointsSolver.getMatchingVariation(
      this.result.question.moves,
      this.result.answer.bestMove,
    );
    if (variation === null) {
      return 1;
    }

    const multiplier = Math.max(
      -0.75 * Math.abs(variation.evaluation - this.result.question.moves.one.evaluation) + 3,
      1,
    );

    if (this.evalPoints() < 0) {
      return 1 / multiplier;
    }

    return multiplier;
  }

  /**
   * @returns Points awarded for question
   */
  totalPoints(): number {
    return (this.foundWinningSide() ? 20 : 0)
      + this.evalPoints() * this.bestMoveMultiplier();
  }

  // Returns first variation with matching move, or null if not found.
  static getMatchingVariation(variations: Moves, move: string) : Move | null {
    const lowercaseMove = move.toLowerCase().replace('+', '');

    if (variations.one.move.toLowerCase() === lowercaseMove) {
      return variations.one;
    }

    if (variations.two && variations.two.move.toLowerCase() === lowercaseMove) {
      return variations.two;
    }

    if (variations.three && variations.three.move.toLowerCase() === lowercaseMove) {
      return variations.three;
    }

    return null;
  }
}

export interface QuestionAnswer {
  question: Question;
  answer: Answer;
}

export interface Answer {
  evaluation: number,
  bestMove: string,
}
