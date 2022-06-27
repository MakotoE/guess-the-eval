use anyhow::{Error, Result};
use clap::Parser;
use pgn_reader::BufferedReader;
use rand::distributions::{Distribution, Uniform};
use rand::rngs::SmallRng;
use rand::SeedableRng;
use shakmaty::fen::Fen;
use shakmaty::{Chess, EnPassantMode, Position};
use std::collections::HashSet;
use std::fs;
use std::hash::{Hash, Hasher};
use std::io::{stdout, Read};
use std::path::{Path, PathBuf};
use vampirc_uci::UciFen;

use crate::question::*;
use crate::stockfish::*;
use crate::visitor::PositionsVisitor;

mod question;
mod stockfish;
mod visitor;

#[derive(Debug, Parser)]
struct Args {
    /// Path to Stockfish binary
    #[clap(long)]
    stockfish_path: PathBuf,
    /// Path to PGN file
    pgn_file_path: PathBuf,
}

fn main() {
    env_logger::init();

    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            match main_().await {
                Ok(_) => {}
                Err(e) => {
                    log::error!("{:?}", e);
                    std::process::exit(1);
                }
            }
        })
}

async fn main_() -> Result<()> {
    let args = Args::parse();
    let positions = get_positions(&args.pgn_file_path, 50)?;

    let mut stockfish = Stockfish::new(&args.stockfish_path, 25).await?;
    let mut questions: Vec<Question> = Vec::with_capacity(positions.len());

    for position in positions {
        match calculate_eval(&mut stockfish, position.position.clone()).await? {
            Some(moves) => questions.push(Question {
                fen: SerializableFen(Fen::from_position(position.position, EnPassantMode::Legal)),
                players: position.players,
                moves,
                pgn: position.pgn,
                turn_number: position.turn_number,
            }),
            None => {}
        }
    }

    serde_json::to_writer(stdout().lock(), &questions)?;
    Ok(())
}

fn get_positions(
    pgn_file_path: &Path,
    number_of_games: usize,
) -> Result<HashSet<PositionAndPlayers>> {
    let mut file = fs::File::open(pgn_file_path)?;

    let mut file_str = String::new();
    file.read_to_string(&mut file_str).unwrap();

    let mut file_split = file_str.as_str().split("\n\n[");

    let mut reader = BufferedReader::new_cursor(&file_str);
    let mut games: Vec<(Vec<Chess>, Players, String)> = Vec::new();
    while let Some(result) = reader.read_game(&mut PositionsVisitor::new())? {
        let (position, players) = result?;
        let pgn = file_split
            .next()
            .ok_or_else(|| Error::msg("expected pgn but did not get any"))?;
        games.push((position, players, pgn.to_string()));
    }

    Ok(choose_positions(&games[..number_of_games]))
}

// Returns None if this position must be skipped.
fn convert_variations(
    position: Chess,
    eval_and_moves: &[Option<EvalAndMove>; 3],
) -> Result<Option<Moves>> {
    // Skip if evaluation is mate or eval is not in range [-20, 20]
    if eval_and_moves[0]
        .as_ref()
        .map_or(false, |EvalAndMove { cp, .. }| cp.abs() > 2000)
        || eval_and_moves[1]
            .as_ref()
            .map_or(false, |EvalAndMove { cp, .. }| cp.abs() > 2000)
        || eval_and_moves[2]
            .as_ref()
            .map_or(false, |EvalAndMove { cp, .. }| cp.abs() > 2000)
    {
        return Ok(None);
    }

    let fen = Fen::from_position(position, EnPassantMode::Legal);
    Ok(Some(Moves {
        one: Move::from_variation(eval_and_moves[0].as_ref().unwrap(), &fen)?,
        two: match &eval_and_moves[1] {
            Some(v) => Some(Move::from_variation(v, &fen)?),
            None => None,
        },
        three: match &eval_and_moves[2] {
            Some(v) => Some(Move::from_variation(v, &fen)?),
            None => None,
        },
    }))
}

async fn calculate_eval(stockfish: &mut Stockfish, position: Chess) -> Result<Option<Moves>> {
    let fen = UciFen::from(
        Fen::from_position(position.clone(), EnPassantMode::Legal)
            .to_string()
            .as_str(),
    );
    let variations = stockfish.calculate(fen).await?;
    match variations {
        Variations::Mate => Ok(None),
        Variations::Variations(variations) => convert_variations(position, &variations),
    }
}

#[derive(Debug, Eq, Clone)]
struct PositionAndPlayers {
    position: Chess,
    players: Players,
    pgn: String,
    turn_number: usize,
}

impl Hash for PositionAndPlayers {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.position.hash(state);
    }
}

impl PartialEq for PositionAndPlayers {
    fn eq(&self, other: &Self) -> bool {
        self.position == other.position
    }
}

/// Selects positions from given games.
/// From games 0 to 50, it selects 2 random positions from each game that match the rules described
/// below. The positions must be unique.
///
/// Selection rules:
/// - The position must be on turn 4 or later
/// - The position must have 4 or more pieces
fn choose_positions(games: &[(Vec<Chess>, Players, String)]) -> HashSet<PositionAndPlayers> {
    let mut rng = SmallRng::from_entropy();

    let mut result: HashSet<PositionAndPlayers> = HashSet::new();

    for game in games {
        if game.0.len() > 8 {
            result.extend(
                Uniform::new(8, game.0.len())
                    .sample_iter(&mut rng)
                    .map(|index| (&game.0[index], index))
                    .filter(|(position, _)| {
                        let board = position.board();
                        let piece_count = board.rooks_and_queens().count()
                            + board.knights().count()
                            + board.bishops().count()
                            + board.kings().count();

                        piece_count >= 4
                    })
                    .map(|(position, index)| PositionAndPlayers {
                        position: position.clone(),
                        players: game.1.clone(),
                        pgn: game.2.clone(),
                        turn_number: index,
                    })
                    .take(2),
            );
        }
    }

    result
}
