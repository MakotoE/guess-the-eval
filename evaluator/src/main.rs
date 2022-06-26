use anyhow::{Error, Result};
use clap::Parser;
use pgn_reader::{BufferedReader, RawHeader, SanPlus, Visitor};
use rand::distributions::{Distribution, Uniform};
use rand::rngs::SmallRng;
use rand::SeedableRng;
use shakmaty::fen::Fen;
use shakmaty::{Chess, EnPassantMode, Position};
use std::collections::HashSet;
use std::fs;
use std::hash::{Hash, Hasher};
use std::io::stdout;
use std::path::PathBuf;
use vampirc_uci::UciFen;

use crate::question::*;
use crate::stockfish::*;

mod question;
mod stockfish;

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
    let file = fs::File::open(Args::parse().pgn_file_path)?;
    let mut reader = BufferedReader::new(file);
    let mut games: Vec<(Vec<Chess>, Players)> = Vec::new();
    while let Some(result) = reader.read_game(&mut PositionsVisitor::new())? {
        games.push(result?);
    }

    // Choose first n games
    let games_subslice = &games[..50];

    let mut stockfish = Stockfish::new(&Args::parse().stockfish_path, 25).await?;
    let mut questions: Vec<Question> = Vec::with_capacity(games_subslice.len());

    let positions = choose_positions(games_subslice);
    for position in positions {
        match calculate_eval(&mut stockfish, position).await? {
            Some(question) => questions.push(question),
            None => {}
        }
    }

    serde_json::to_writer(stdout().lock(), &questions)?;
    Ok(())
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

async fn calculate_eval(
    stockfish: &mut Stockfish,
    position: PositionAndPlayers,
) -> Result<Option<Question>> {
    let fen = UciFen::from(
        Fen::from_position(position.position.clone(), EnPassantMode::Legal)
            .to_string()
            .as_str(),
    );
    let variations = stockfish.calculate(fen).await?;
    match variations {
        Variations::Mate => Ok(None),
        Variations::Variations(variations) => {
            let moves = convert_variations(position.position.clone(), &variations)?;
            Ok(match moves {
                Some(m) => Some(Question {
                    fen: SerializableFen(Fen::from_position(
                        position.position,
                        EnPassantMode::Legal,
                    )),
                    players: position.players,
                    moves: m,
                }),
                None => None,
            })
        }
    }
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
        if self.error.is_some() {
            return;
        }

        let last_position = self.positions.last().unwrap().clone();
        let m = match san.san.to_move(&last_position) {
            Ok(m) => m,
            Err(e) => {
                let fen = Fen::from_position(last_position, EnPassantMode::Legal);
                self.error =
                    Some(Error::from(e).context(format!("position: {}, san: {}", fen, san,)));
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

#[derive(Debug, Eq, Clone)]
struct PositionAndPlayers {
    position: Chess,
    players: Players,
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
fn choose_positions(games: &[(Vec<Chess>, Players)]) -> HashSet<PositionAndPlayers> {
    let mut rng = SmallRng::from_entropy();

    let mut result: HashSet<PositionAndPlayers> = HashSet::new();

    for game in games {
        if game.0.len() > 8 {
            result.extend(
                Uniform::new(8, game.0.len())
                    .sample_iter(&mut rng)
                    .map(|index| &game.0[index])
                    .filter(|position| {
                        let board = position.board();
                        let piece_count = board.rooks_and_queens().count()
                            + board.knights().count()
                            + board.bishops().count()
                            + board.kings().count();

                        piece_count >= 4
                    })
                    .map(|position| PositionAndPlayers {
                        position: position.clone(),
                        players: game.1.clone(),
                    })
                    .take(2),
            );
        }
    }

    result
}
