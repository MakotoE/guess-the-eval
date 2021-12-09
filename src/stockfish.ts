if (!crossOriginIsolated) {
	console.log('SharedArrayBuffer is disabled!');
}

const stockfish = new Worker('stockfish.js');
stockfish.onmessage = function(event) {
	console.log(event);
}

stockfish.postMessage("uci");
stockfish.postMessage("setoption name Threads value 4");
stockfish.postMessage("position fen 3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27");
stockfish.postMessage("go depth 20");
