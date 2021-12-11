export class Stockfish {
	private readonly stockfish: Worker;
	private lastEval: number = 0;
	private evalHandler: (evaluation: number) => void = () => {};

	constructor() {
		if (!crossOriginIsolated) {
			console.error('SharedArrayBuffer is disabled!');
		}

		this.stockfish = new Worker('stockfish.js');
		this.stockfish.onmessage = (event) => {
			const data = event.data as string;
			console.info(data);

			const matchEval = /^info depth \d+ seldepth \d+ multipv \d+ score cp (\d+)/;
			const matches = data.match(matchEval);
			if (matches != null) {
				this.lastEval = parseInt(matches[1]);
			}

			if (data.startsWith('bestmove')) {
				this.evalHandler(this.lastEval);
			}
		}
		this.stockfish.onmessageerror = function(event) {
			console.error(event);
		}
		this.stockfish.postMessage('uci');
		this.stockfish.postMessage('setoption name Threads value 4');
	}

	getEval(fen: String): Promise<number> {
		return new Promise(resolve => {
			this.evalHandler = resolve;
			this.stockfish.postMessage('position fen ' + fen);
			this.stockfish.postMessage('go movetime 2');
		});
	}
}
