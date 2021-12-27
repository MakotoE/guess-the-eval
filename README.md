# Guess the Eval

[Guess the Eval](https://makotoe.github.io/guess-the-eval/) presents a series of chess positions, and you have to guess what evaluation Stockfish gives to those positions. In addition, you will determine what the best moves are, and guess who played in that game (or where it took place) for bonus points.

As you can tell, this is a prototype.

If you're curious about how scores are caluculated, you can check [`src/PointsSolver.ts`](src/PointsSolver.ts).

See [`src/index.tsx`](src/index.tsx) to calculate evaluations for the questions. Originally, Stockfish was run on the client. But then I decided that Stockfish doesn't need to run in the client as all evaluations can be calculated in advance and added to the code. Because of that, Stockfish.js is used. If I were to rewrite it, I would create a CLI for Stockfish.

# Credits
- Image assets: https://github.com/ornicar/lila
- React wrapper for Chessground: https://github.com/react-chess/chessground
