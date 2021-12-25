import { Chess } from 'chess.ts';

// TODO compute all evals compile time
export class Stockfish {
  private readonly stockfish: Worker;

  constructor() {
    this.stockfish = new Worker('/stockfish.js');
    // eslint-disable-next-line no-console
    this.stockfish.onmessage = (event) => console.info(event.data);
    // eslint-disable-next-line no-console
    this.stockfish.onmessageerror = (event) => console.error(event);
    this.stockfish.postMessage('uci');
    this.stockfish.postMessage('setoption name Threads value 4');
    this.stockfish.postMessage('setoption name Hash value 512');
    this.stockfish.postMessage('setoption name MultiPV value 3');
  }

  /**
   * @returns null if given string is not an eval string
   */
  static parseEvalString(s: string):
  { depth: number, variation: number, cp: number, move: string } | null {
    const matchEval = /^info depth (?<depth>\d+) seldepth \d+ multipv (?<variation>\d+) score cp (?<cp>[-\d]+) nodes \d+ nps \d+( hashfull \d+)? time \d+ pv (?<move>\S+)/;
    const matches = s.match(matchEval);
    if (matches === null) {
      return null;
    }

    if (matches.groups === undefined) {
      throw new Error();
    }

    return {
      depth: parseInt(matches.groups.depth, 10),
      variation: parseInt(matches.groups.variation, 10) - 1,
      cp: parseInt(matches.groups.cp, 10),
      move: matches.groups.move,
    };
  }

  getEval(fen: string, depthCB: (depth: number) => void): Promise<BestMoves> {
    return new Promise((resolve) => {
      const currentEval: RawOutput = [];

      this.stockfish.onmessage = (event: MessageEvent) => {
        const data = event.data as string;
        // eslint-disable-next-line no-console
        console.info(data);

        if (data.startsWith('bestmove')) {
          resolve(Stockfish.rawEvalToEvaluation(currentEval, fen));
        }

        const evaluation = Stockfish.parseEvalString(data);
        if (evaluation === null) {
          return;
        }

        currentEval[evaluation.variation] = {
          move: evaluation.move,
          evaluation: evaluation.cp,
        };

        depthCB(evaluation.depth);
      };

      this.stockfish.postMessage(`position fen ${fen}`);
      this.stockfish.postMessage('go movetime 5000 depth 40');
    });
  }

  static rawEvalToEvaluation(raw: RawOutput, fen: string): BestMoves {
    const chess = new Chess(fen);

    return raw.map((variation) => {
      const move = chess.move(variation.move, { sloppy: true, dry_run: true });
      if (move === null) {
        throw new Error(`move is null; invalid move: ${variation.move}`);
      }

      let evaluation = variation.evaluation / 100;
      if (chess.turn() === 'b') {
        evaluation *= -1;
      }

      return {
        move: move.san,
        evaluation,
      };
    }) as BestMoves;
  }
}

export interface Variation {
  move: string;
  evaluation: number;
}

// BestMoves has 1 to 3 items. The first variation gives the current evaluation.
export type BestMoves = Variation[];

// Evaluation is in centipawns. If it's black's turn to play, evaluation needs to be negated. Moves
// are in long algebraic notation and need to be converted to SAN.
type RawOutput = BestMoves;
