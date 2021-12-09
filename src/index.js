console.log(crossOriginIsolated);

const stockfish = new Worker('../node_modules/stockfish/src/stockfish.js');
stockfish.onmessage = function(event) {
  console.log(event);
}
