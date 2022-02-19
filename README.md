# Guess the Eval

[Guess the Eval](https://makotoe.github.io/guess-the-eval/) presents a series of chess positions, and you have to guess what evaluation Stockfish gives to those positions. In addition, you will determine what the best moves are. You can also guess who played in that game for bonus points.

[TODO include screenshots]

The TypeScript project for the web app is located at the root of this repo. The Rust-based `evaluator` which is responsible for selecting positions and calculating evals is located under [`evaluator`](evaluator).

# TODO

- Refactor evaluator so that it takes one position at a time instead of an array of positions, because there's a bug that's making it stop while calculating
- Add mate evaluation
- Save full PGN so that the game is viewable on Lichess
- Support mobile devices
- Blitz mode: Questions are timed, and you input either evals or best moves
