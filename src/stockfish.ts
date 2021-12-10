export class Stockfish {
	private stockfish: Worker;

	constructor() {
		if (!crossOriginIsolated) {
			console.error('SharedArrayBuffer is disabled!');
		}

		this.stockfish = new Worker('stockfish.js');
		this.stockfish.onmessage = (event) => {
			console.info(event);
		};
		this.stockfish.postMessage('uci');
		this.stockfish.postMessage('setoption name Threads value 4');
		this.stockfish.onmessageerror = function(event) {
			console.error(event);
		}
	}

	getEval(fen: String): Promise<number> {
		this.stockfish.postMessage('position fen ' + fen);
		this.stockfish.postMessage('go depth 20');

		return new Promise(resolve => {
			this.stockfish.onmessage = (event) => {
				console.info(event);
				const data = event.data as string;
				if (data.startsWith('info depth 20 seldepth ')) {
					const matchCP = /^info depth 20 seldepth \d+ multipv \d+ score cp (\d+)/;
					const matches = data.match(matchCP);
					if (matches != null) {
						resolve(parseInt(matches[1]));
					}
				}
			}
		});
	}
}
