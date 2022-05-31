import { Question, Variation, Variations } from './questions';

/**
 * Calculates points awarded for position.
 *
 * 1. 20 points for correctly guessing the winning side or that the position is a draw
 *
 * 2. The number of points for the eval guess is given by:
 * points = -8(1/abs(0.5c + 1))d^2 + 50
 * if points < 0: points = points / 4
 * where c = correct eval, d = abs(guessed eval - c)
 *
 * 3. Guessing a best move multiplies your eval points by:
 * max(-0.75 * abs(guessedMoveEval - bestMoveEval) + 3, 1)
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
      && this.result.question.variations.one.evaluation === 0
    ) {
      return true;
    }

    return this.result.answer.evaluation * this.result.question.variations.one.evaluation > 0;
  }

  /**
   * @returns Points awarded for eval
   */
  evalPoints(): number {
    const correctEval = this.result.question.variations.one.evaluation;
    const guessEval = this.result.answer.evaluation;
    const unadjusted = -8 * (1 / Math.abs(0.5 * correctEval + 1))
      * Math.abs(guessEval - correctEval)
      + 50;
    if (unadjusted < 0) {
      return unadjusted / 4;
    }
    return unadjusted;
  }

  /**
   * @returns true if guessed move was in the top 3
   */
  foundBestMove(): boolean {
    const variation = PointsSolver.getMatchingVariation(
      this.result.question.variations,
      this.result.answer.bestMove,
    );
    return variation !== null;
  }

  /**
   * @returns Eval points multiplier
   */
  bestMoveMultiplier(): number {
    const variation = PointsSolver.getMatchingVariation(
      this.result.question.variations,
      this.result.answer.bestMove,
    );
    if (variation === null) {
      return 1;
    }

    return Math.max(
      -0.75 * Math.abs(variation.evaluation - this.result.question.variations.one.evaluation) + 3,
      1,
    );
  }

  /**
   * @returns true if a player was guessed
   */
  foundPlayer(): boolean {
    const strings = [
      this.result.question.players.white,
      this.result.question.players.black,
    ];
    const possibleWords = new Set<string>(
      strings.map((s) => s.toLowerCase().replace(/,/gm, '').split(' ')).flat(),
    );
    return this.result.answer.player.split(' ')
      .some((word) => possibleWords.has(word.toLowerCase()));
  }

  /**
   * @returns Points awarded for question
   */
  totalPoints(): number {
    return (this.foundWinningSide() ? 20 : 0)
      + this.evalPoints() * this.bestMoveMultiplier()
      + (this.foundPlayer() ? 10 : 0);
  }

  // Returns first variation with matching move, or null if not found.
  static getMatchingVariation(variations: Variations, move: string) : Variation | null {
    const lowercaseMove = move.toLowerCase();

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
  player: string,
}
