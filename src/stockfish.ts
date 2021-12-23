import {Chess} from 'chess.ts';

export class Stockfish {
	private readonly stockfish: Worker;

	// TODO it is possible for less than 3 moves to be given
	private lastEval: RawOutput = [{move: '', evaluation: 0}, {move: '', evaluation: 0}, {move: '', evaluation: 0}];

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private evalHandler: (evaluation: BestMoves) => void = () => {};
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private depthCB: (depth: number) => void = () => {};

	constructor() {
		this.stockfish = new Worker('/stockfish.js');
		this.stockfish.onmessage = event => this.onmessage(event);
		this.stockfish.onmessageerror = event => console.error(event);
		this.stockfish.postMessage('uci');
		this.stockfish.postMessage('setoption name Threads value 4');
		this.stockfish.postMessage('setoption name Hash value 512');
		this.stockfish.postMessage('setoption name MultiPV value 3');
	}

	private onmessage(event: MessageEvent) {
		const data = event.data as string;
		console.info(data);

		if (data.startsWith('bestmove')) {
			this.evalHandler(this.lastEval);
		}

		const evaluation = Stockfish.parseEvalString(data);
		if (evaluation === null) {
			return;
		}

		this.lastEval[evaluation.variation] = {
			move: evaluation.move,
			evaluation: evaluation.cp,
		};

		this.depthCB(evaluation.depth);
	}

	/**
	 * @returns null if given string is not an eval string
	 */
	static parseEvalString(s: string): {depth: number, variation: number, cp: number, move: string} | null {
		const matchEval = /^info depth (?<depth>\d+) seldepth \d+ multipv (?<variation>\d+) score cp (?<cp>\d+) nodes \d+ nps \d+ .+ time \d+ pv (?<move>\S+)/;
		const matches = s.match(matchEval);
		if (matches === null) {
			return null;
		}

		if (matches.groups === undefined) {
			throw new Error();
		}

		return {
			depth: parseInt(matches.groups.depth),
			variation: parseInt(matches.groups.variation) - 1,
			cp: parseInt(matches.groups.cp),
			move: matches.groups.move,
		}
	}

	getEval(fen: string, depthCB: (depth: number) => void): Promise<BestMoves> {
		return new Promise(resolve => {
			this.evalHandler = evaluation => {
				resolve(rawEvalToEvaluation(evaluation, fen));
			};
			this.depthCB = depthCB;
			this.stockfish.postMessage('position fen ' + fen);
			this.stockfish.postMessage('go movetime 5000 depth 40');
		});
	}
}

export interface Variation {
	move: string;
	evaluation: number;
}

// The first variation gives the current evaluation.
export type BestMoves = [Variation, Variation, Variation];

// Evaluation is in centipawns. If it's black's turn to play, evaluation needs to be negated. Moves are in long
// algebraic notation and need to be converted to SAN.
type RawOutput = BestMoves;

function rawEvalToEvaluation(raw: RawOutput, fen: string): BestMoves {
	const chess = new Chess(fen);

	return raw.map(variation => {
		const move = chess.move(variation.move, {sloppy: true, dry_run: true});
		if (move === null) {
			throw new Error(`move is null; invalid move: ${variation.move}`);
		}

		let evaluation = variation.evaluation /= 100;
		if (chess.turn() === 'b') {
			evaluation *= -1;
		}

		return {
			move: move.san,
			evaluation,
		};
	}) as BestMoves;
}
