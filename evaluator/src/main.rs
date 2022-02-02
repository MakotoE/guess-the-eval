use anyhow::{Error, Result};
use clap::Parser;
use pgn_reader::{BufferedReader, Nag, RawComment, RawHeader, Skip, Visitor};
use shakmaty::fen::Fen;
use shakmaty::san::SanPlus;
use shakmaty::{Chess, Outcome, Position};
use std::collections::HashSet;
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

fn main() {
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            match main_().await {
                Ok(_) => {}
                Err(e) => {
                    eprintln!("{:?}", e);
                    std::process::exit(1);
                }
            }
        })
}

async fn main_() -> Result<()> {
    let file = fs::File::open(Args::parse().pgn_file_path)?;
    let mut reader = BufferedReader::new(file);
    let mut games: Vec<(Vec<Chess>, Players)> = Vec::new();
    loop {
        match reader.read_game(&mut PositionsVisitor::new())? {
            Some(result) => {
                games.push(result?);
            }
            None => break,
        }
    }

    // calculate_evals(Path::new("./stockfish_14.1_linux_x64_avx2"), &positions).await?;

    Ok(())
}

#[derive(Debug)]
struct PositionsVisitor {
    positions: Vec<Chess>,
    players: Players,
    error: Option<Error>,
}

impl PositionsVisitor {
    fn new() -> Self {
        Self {
            positions: vec![Chess::default()],
            players: Players::default(),
            error: None,
        }
    }
}

impl Visitor for PositionsVisitor {
    type Result = Result<(Vec<Chess>, Players)>;

    fn header(&mut self, key: &[u8], value: RawHeader<'_>) {
        match key {
            b"White" => self.players.white = value.decode_utf8_lossy().to_string(),
            b"Black" => self.players.black = value.decode_utf8_lossy().to_string(),
            _ => {}
        }
    }

    fn san(&mut self, san: SanPlus) {
        let last_position = self.positions.last().unwrap().clone();
        let m = match san.san.to_move(&last_position) {
            Ok(m) => m,
            Err(e) => {
                let fen = Fen::from_setup(&last_position);
                let err = Error::from(e).context(format!(
                    "position: {}, san: {}",
                    fen.to_string(),
                    san.to_string(),
                ));
                self.error = Some(err.into());
                return;
            }
        };

        match last_position.play(&m) {
            Ok(new_pos) => self.positions.push(new_pos),
            Err(e) => self.error = Some(e.into()),
        }
    }

    fn end_game(&mut self) -> Self::Result {
        match self.error.take() {
            Some(e) => Err(e),
            None => Ok((
                std::mem::take(&mut self.positions),
                std::mem::take(&mut self.players),
            )),
        }
    }
}

#[derive(Debug, Default)]
struct Players {
    white: String,
    black: String,
}

fn choose_positions() -> HashSet<Chess> {
    todo!()
}
