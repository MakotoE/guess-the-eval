mod question;

use crate::question::*;
use anyhow::{Error, Result};
use clap::Parser;
use pgn_reader::{BufferedReader, Nag, RawComment, RawHeader, Skip, Visitor};
use shakmaty::fen::Fen;
use shakmaty::san::{SanError, SanPlus};
use shakmaty::uci::Uci;
use shakmaty::{Chess, File, Move, Outcome, PlayError, Position, Rank, Role, Square};
use std::fs;
use std::io::{stdout, Write};
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader, Lines};
use tokio::process::{ChildStdin, ChildStdout, Command};
use tokio::sync::Notify;
use vampirc_uci::{
    parse_one, Serializable, UciFen, UciInfoAttribute, UciMessage, UciMove, UciSearchControl,
    UciSquare,
};

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

    println!("{:?}", positions.len());

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

async fn main_() -> Result<()> {
    let positions: Vec<String> = vec![];

    let mut child = Command::new("./stockfish_14.1_linux_x64_avx2")
        .stdout(Stdio::piped())
        .stdin(Stdio::piped())
        .spawn()?;

    let semaphore = Arc::new(Notify::new());

    let mut child_stdin = child.stdin.take().unwrap();

    tokio::spawn({
        let positions: Vec<UciFen> = positions.iter().map(|p| UciFen::from(p.as_str())).collect();
        let semaphore = semaphore.clone();
        async move {
            send_messages(&mut child_stdin, &positions, semaphore).await;
        }
    });

    let mut child_stdout = BufReader::new(child.stdout.take().unwrap()).lines();

    let mut result: Vec<Question> = Vec::with_capacity(positions.len());

    for position in positions {
        let raw_variations = read_all_evals(&mut child_stdout).await?;
        let mut variations: Vec<Variation> = Vec::with_capacity(3);
        let fen = Fen::from_ascii(position.as_bytes())?;
        for variation in raw_variations {
            if let Some(variation) = variation {
                let variation = Variation::from_raw_variation(&variation, &fen)?;
                variations.push(variation);
            }
        }
        result.push(Question {
            fen: SerializableFen(fen),
            variations,
        });
        semaphore.notify_one();
    }

    let stdout = stdout();
    let mut stdout = stdout.lock();
    serde_json::to_writer_pretty(&mut stdout, &result)?;
    stdout.flush()?;

    child.wait().await.unwrap();
    Ok(())
}

async fn send_messages(stdin: &mut ChildStdin, positions: &[UciFen], semaphore: Arc<Notify>) {
    let result: Result<()> = async {
        let setup_messages = &[
            UciMessage::Uci,
            UciMessage::SetOption {
                name: "Threads".to_string(),
                value: Some(8.to_string()),
            },
            UciMessage::SetOption {
                name: "Hash".to_string(),
                value: Some(1024.to_string()),
            },
            UciMessage::SetOption {
                name: "MultiPV".to_string(),
                value: Some(3.to_string()),
            },
        ];

        for message in setup_messages {
            write_message(stdin, &message).await?;
        }

        for position in positions {
            let position_msg = UciMessage::Position {
                startpos: false,
                fen: Some(UciFen::from(position.as_str())),
                moves: vec![],
            };
            write_message(stdin, &position_msg).await?;

            let go_msg = UciMessage::Go {
                time_control: None,
                search_control: Some(UciSearchControl::depth(10)),
            };
            write_message(stdin, &go_msg).await?;
            stdin.flush().await?;
            semaphore.notified().await;
        }

        write_message(stdin, &UciMessage::Quit).await?;
        Ok(())
    }
    .await;
    if let Err(e) = result {
        panic!("error: {}", e);
    }
}

async fn read_all_evals(
    stdin: &mut Lines<BufReader<ChildStdout>>,
) -> Result<[Option<RawVariation>; 3]> {
    let mut variations: [Option<RawVariation>; 3] = [None, None, None];
    loop {
        if let Some(s) = stdin.next_line().await? {
            if !s.is_empty() {
                let message = parse_one(&s);
                eprintln!("{}", message.serialize());

                match message {
                    UciMessage::Info(attributes) => {
                        if let Some(eval) = attributes_to_eval(&attributes) {
                            let index = eval.variation_number as usize - 1;
                            variations[index] = Some(eval);
                        }
                    }
                    UciMessage::BestMove { .. } => {
                        return Ok(variations);
                    }
                    _ => {}
                }
            }
        }
    }
}

#[derive(Debug, Clone)]
pub struct RawVariation {
    variation_number: u16,
    cp: i32,
    uci_move: Uci,
}

fn attributes_to_eval(attributes: &[UciInfoAttribute]) -> Option<RawVariation> {
    let mut variation_number: Option<u16> = None;
    let mut cp: Option<i32> = None;
    let mut uci_move: Option<Uci> = None;

    for attribute in attributes {
        match attribute {
            UciInfoAttribute::MultiPv(n) => variation_number = Some(*n),
            UciInfoAttribute::Score { cp: score_cp, .. } => {
                cp = Some(score_cp.unwrap());
            }
            UciInfoAttribute::Pv(moves) => {
                uci_move = Some(vampirc_to_shakmaty(&moves[0]));
            }
            UciInfoAttribute::String(s) => {
                assert!(s.starts_with("NNUE"), "{}", s);
                return None;
            }
            _ => {}
        }
    }
    Some(RawVariation {
        variation_number: variation_number.unwrap(),
        cp: cp.unwrap(),
        uci_move: uci_move.unwrap(),
    })
}

fn vampirc_to_shakmaty(uci_move: &UciMove) -> Uci {
    fn convert_square(square: &UciSquare) -> Square {
        (
            File::from_char(square.file).unwrap(),
            Rank::ALL.get(square.rank as usize - 1).unwrap().clone(),
        )
            .into()
    }

    Uci::Normal {
        from: convert_square(&uci_move.from),
        to: convert_square(&uci_move.to),
        promotion: uci_move
            .promotion
            .map(|p| Role::from_char(p.as_char().unwrap_or('p')).unwrap()),
    }
}

async fn write_message(stdin: &mut ChildStdin, message: &UciMessage) -> Result<()> {
    stdin
        .write_all((message.serialize() + "\n").as_bytes())
        .await?;
    Ok(())
}
