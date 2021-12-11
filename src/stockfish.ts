export class Stockfish {
	private readonly stockfish: Worker;
	private lastEval: number = 0;
	private evalHandler: (evaluation: number) => void = () => {};
	private depthCB: (depth: number) => void = () => {};

	constructor() {
		if (!crossOriginIsolated) {
			console.error('SharedArrayBuffer is disabled!');
		}

		this.stockfish = new Worker('stockfish.js');
		this.stockfish.onmessage = event => this.onmessage(event);
		this.stockfish.onmessageerror = console.error;
		this.stockfish.postMessage('uci');
		this.stockfish.postMessage('setoption name Threads value 4');
		this.stockfish.postMessage('setoption name Hash value 512');
	}

	private onmessage(event: MessageEvent) {
		const data = event.data as string;
		console.info(data);

		const matchEval = /^info depth (\d+) seldepth \d+ multipv \d+ score cp (\d+)/;
		const matches = data.match(matchEval);
		if (matches != null) {
			this.lastEval = parseInt(matches[2]);
			this.depthCB(parseInt(matches[1]));
		}

		if (data.startsWith('bestmove')) {
			this.evalHandler(this.lastEval);
		}
	}

	getEval(fen: String, depthCB: (depth: number) => void): Promise<number> {
		return new Promise(resolve => {
			this.evalHandler = resolve;
			this.depthCB = depthCB;
			this.stockfish.postMessage('position fen ' + fen);
			this.stockfish.postMessage('go movetime 10000 depth 40');
		});
	}
}
