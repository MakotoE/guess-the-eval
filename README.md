# Guess the Eval

[Guess the Eval](https://makotoe.github.io/guess-the-eval/) presents a series of chess positions, and you have to guess what evaluation Stockfish gives to those positions. In addition, you will determine what the best moves are. You can also guess who played in that game, or in which tournament it took place, for bonus points.

As you can tell, this is a prototype.

If you're curious about how scores are caluculated, you can check [`src/PointsSolver.ts`](src/PointsSolver.ts).

See [`src/index.tsx`](src/index.tsx) to calculate evaluations for the questions. Originally, Stockfish was run on the client. But then I decided that Stockfish doesn't need to run in the client as all evaluations can be calculated in advance and added to the code. Because of that, Stockfish.js is used. If I were to rewrite it, I would create a CLI for Stockfish.

# Credits
- Image assets: https://github.com/ornicar/lila

# TODO

Thanks to your feedback, I compiled a list of potential ways to improve the game.

- Lower eval values (such as +1 to +4) should have a higher weight than lower eval values (+9 to +12)
- Draggable pieces for best move input
- Draggable slider to input eval (like the eval bar)
- A positions database
- Difficulty labels
- A refined interface design
- Add help page into interface
- Stockfish detailed evaluation info?
- Blitz mode: Questions are timed, and you either input evals or best moves
- Show best moves on board
