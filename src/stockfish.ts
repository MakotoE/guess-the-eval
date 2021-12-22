import {Chess} from 'chess.ts';

export class Stockfish {
	private readonly stockfish: Worker;

	private lastEval: RawEvalOutput = {evaluation: 0, bestMoves: ['', '', '']};

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private evalHandler: (evaluation: EvaluationAndBestMove) => void = () => {};
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

		const matchEval = /^info depth (\d+) seldepth \d+ multipv (\d+) score cp (\d+) nodes \d+ nps \d+ .+ time \d+ pv (\S+)/;
		const matches = data.match(matchEval);
		if (matches !== null) {
			const variation = parseInt(matches[2]) - 1;
			if (variation === 0) {
				this.lastEval.evaluation = parseInt(matches[3]);
			}
			this.lastEval.bestMoves[variation] = matches[4];
			this.depthCB(parseInt(matches[1]));
		}

		if (data.startsWith('bestmove')) {
			this.evalHandler(this.lastEval);
		}
	}

	getEval(fen: string, depthCB: (depth: number) => void): Promise<EvaluationAndBestMove> {
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

export interface EvaluationAndBestMove {
	evaluation: number;
	bestMoves: [string, string, string];
}

// Evaluation is in centipawns. If it's black's turn to play, evaluation needs to be negated. Best moves are in long
// algebraic notation and needs to be converted to SAN.
type RawEvalOutput = EvaluationAndBestMove;

function rawEvalToEvaluation(input: RawEvalOutput, fen: string): EvaluationAndBestMove {
	const result: EvaluationAndBestMove = input;

	result.evaluation /= 100;

	const chess = new Chess(fen);
	if (chess.turn() === 'b') {
		result.evaluation *= -1;
	}

	// Convert best moves
	result.bestMoves = result.bestMoves.map(input => {
		const move = chess.move(input, {sloppy: true, dry_run: true});
		if (move === null) {
			throw new Error('move is null; invalid move');
		}
		return move.san;
	}) as EvaluationAndBestMove['bestMoves'];

	return result;
}
