import * as questionsData from '../evaluator/questions.json';

export interface Question {
  fen: string,
  players: { white: string, black: string },
  moves: Moves,
}

export interface Move {
  move: San,
  evaluation: number,
}

// San is a lowercase SAN.
export type San = string;

// Contains up to 3 top moves. The first move gives the current evaluation.
export interface Moves {
  one: Move,
  two: Move | null,
  three: Move | null,
}

// Returns number of non-null variations.
export function numberOfVariations(variations: Moves): number {
  if (variations.three !== null) {
    return 3;
  }

  if (variations.two !== null) {
    return 2;
  }

  return 1;
}

export const questionsDatabase = questionsData as unknown as Question[];
