import * as questionsData from '../evaluator/questions.json';

export interface Question {
  fen: string,
  players: { white: string, black: string },
  variations: Variations,
}

export interface Variation {
  move: string,
  evaluation: number,
}

// Variations contains up to 3 top moves. The first variation gives the current evaluation.
export interface Variations {
  one: Variation,
  two: Variation | null,
  three: Variation | null,
}

// Returns number of non-null variations.
export function numberOfVariations(variations: Variations): number {
  if (variations.three !== null) {
    return 3;
  }

  if (variations.two !== null) {
    return 2;
  }

  return 1;
}

export const questions = questionsData as unknown as Question[];
