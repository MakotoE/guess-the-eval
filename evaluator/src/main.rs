use anyhow::{Error, Result};
use clap::Parser;
use pgn_reader::{BufferedReader, Visitor};
use shakmaty::san::SanPlus;
use shakmaty::{Chess, Position};
use std::fs;
use std::path::{Path, PathBuf};

use crate::question::*;
use crate::stockfish::calculate_evals;

mod question;
mod stockfish;

#[derive(Debug, Parser)]
struct Args {
    pgn_file_path: PathBuf,
}

#[tokio::main]
async fn main() -> Result<()> {
    let file = fs::File::open(Args::parse().pgn_file_path)?;
    let mut reader = BufferedReader::new(file);
    let mut positions: Vec<Chess> = Vec::new();
    loop {
        match reader.read_game(&mut PositionsVisitor::new())? {
            Some(result) => {
                positions.push(result?);
            }
            None => break,
        }
    }

    calculate_evals(Path::new("./stockfish_14.1_linux_x64_avx2"), &positions).await?;

    Ok(())
}

#[derive(Debug)]
struct PositionsVisitor {
    position: Chess,
    error: Option<Error>,
}

impl PositionsVisitor {
    fn new() -> Self {
        Self {
            position: Chess::default(),
            error: None,
        }
    }
}

impl Visitor for PositionsVisitor {
    type Result = Result<Chess>;

    fn san(&mut self, san: SanPlus) {
        let position = std::mem::take(&mut self.position);
        let m = match san.san.to_move(&position) {
            Ok(m) => m,
            Err(e) => {
                self.error = Some(e.into());
                return;
            }
        };

        match position.play(&m) {
            Ok(new_pos) => self.position = new_pos,
            Err(e) => self.error = Some(e.into()),
        }
    }

    fn end_game(&mut self) -> Self::Result {
        match self.error.take() {
            Some(e) => Err(e),
            None => Ok(std::mem::take(&mut self.position)),
        }
    }
}
