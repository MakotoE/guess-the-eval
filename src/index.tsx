if (!crossOriginIsolated) {
	console.log('SharedArrayBuffer is disabled!');
}

const stockfish = new Worker('stockfish.js');
stockfish.onmessage = function(event) {
	console.log(event);
}
