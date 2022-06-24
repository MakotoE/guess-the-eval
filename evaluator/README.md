`evaluator` selects positions from the given PGN file and calculates evaluations. It outputs positions in JSON format which should be piped to the `questions.json` file.

Run with `RUST_BACKTRACE=1;RUST_LOG=evaluator cargo run -- --stockfish-path [stockfish path] [pgn path] > questions.json`