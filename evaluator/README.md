`evaluator` selects positions from the given PGN file and calculates evaluations. It outputs positions in JSON format which should be piped to the `questions.json` file.

Build with `RUSTFLAGS='-C target-cpu=native' cargo build --release`

Run with `RUST_LOG=evaluator ./target/release/evaluator ../<PATH>.pgn > questions.json`