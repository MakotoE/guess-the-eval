export class Stockfish {
	private readonly stockfish: Worker;

	// evaluation is in centipawns. It is dependent on the turn. If it's black's turn to play, evaluation needs to be
	// negated.
	private lastEval: EvaluationAndBestMove = {evaluation: 0, bestMoves: ['', '', '']};

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private evalHandler: (evaluation: EvaluationAndBestMove) => void = () => {};
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private depthCB: (depth: number) => void = () => {};

	constructor() {
		if (!crossOriginIsolated) {
			console.error('SharedArrayBuffer is disabled!');
		}

		// Stop cached worker
		this.stockfish = new Worker('/stockfish.js');
		this.stockfish.terminate();

		this.stockfish = new Worker('/stockfish.js');
		this.stockfish.onmessage = event => this.onmessage(event);
		this.stockfish.onmessageerror = console.error;
		this.stockfish.postMessage('uci');
		this.stockfish.postMessage('setoption name Threads value 4');
		this.stockfish.postMessage('setoption name Hash value 512');
		this.stockfish.postMessage('setoption name MultiPV value 3');
	}

	private onmessage(event: MessageEvent) {
		const data = event.data as string;
		console.info(data);

		const matchEval = /^info depth (\d+) seldepth \d+ multipv (\d+) score cp (\d+) nodes \d+ nps \d+ .+ time \d+ pv (.+)/;
		const matches = data.match(matchEval);
		if (matches != null) {
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
				if (getTurn(fen) == Turn.Black) {
					evaluation.evaluation /= -100;
				} else {
					evaluation.evaluation /= 100;
				}

				resolve(evaluation);
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

export enum Turn {
	White,
	Black,
}

export function getTurn(fen: string): Turn {
	const spaceIndex = fen.indexOf(' ');
	switch (fen[spaceIndex + 1]) {
		case 'w':
			return Turn.White;
		case 'b':
			return Turn.Black;
		default:
			throw new Error(`unexpected character: ${fen[spaceIndex + 1]}`);
	}
}
