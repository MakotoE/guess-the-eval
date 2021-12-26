import { BestMoves } from './stockfish';

export interface Question {
  fen: string,
  players: { white: string, black: string },
  tournament: string,
  url: string,
  bestMoves: BestMoves,
}
