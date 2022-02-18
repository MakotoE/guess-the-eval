use crate::{Variation, Variations};
use anyhow::Result;
use shakmaty::fen::Fen;
use shakmaty::uci::Uci;
use shakmaty::{Chess, File, Rank, Role, Square};
use std::path::Path;
use std::process::Stdio;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader, Lines};
use tokio::process::{ChildStdin, ChildStdout, Command};
use tokio::sync::Notify;
use vampirc_uci::{
    parse_one, Serializable, UciFen, UciInfoAttribute, UciMessage, UciMove, UciSearchControl,
    UciSquare,
};

pub async fn calculate_evals(
    stockfish_path: &Path,
    positions: &[Chess],
    depth: u8,
) -> Result<Vec<Variations>> {
    let mut child = Command::new(stockfish_path)
        .stdout(Stdio::piped())
        .stdin(Stdio::piped())
        .spawn()?;

    let semaphore = Arc::new(Notify::new());

    let mut child_stdin = child.stdin.take().unwrap();

    tokio::spawn({
        let positions: Vec<UciFen> = positions
            .iter()
            .map(|pos| UciFen::from(Fen::from_setup(pos).to_string().as_str()))
            .collect();
        let semaphore = semaphore.clone();
        async move {
            send_messages(&mut child_stdin, &positions, semaphore, depth).await;
        }
    });

    let mut child_stdout = BufReader::new(child.stdout.take().unwrap()).lines();

    let mut result: Vec<Variations> = Vec::with_capacity(positions.len());

    for (i, position) in positions.iter().enumerate() {
        log::info!("position {}/{}", i, positions.len());

        let raw_variations = read_all_evals(&mut child_stdout).await?;
        let fen = Fen::from_setup(position);
        let variations: Variations = Variations {
            one: Variation::from_raw_variation(raw_variations[0].as_ref().unwrap(), &fen)?,
            two: match &raw_variations[1] {
                Some(v) => Some(Variation::from_raw_variation(v, &fen)?),
                None => None,
            },
            three: match &raw_variations[2] {
                Some(v) => Some(Variation::from_raw_variation(v, &fen)?),
                None => None,
            },
        };

        result.push(variations);
        semaphore.notify_one();
    }

    child.wait().await.unwrap();
    Ok(result)
}

async fn send_messages(
    stdin: &mut ChildStdin,
    positions: &[UciFen],
    semaphore: Arc<Notify>,
    depth: u8,
) {
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
            write_message(stdin, message).await?;
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
                search_control: Some(UciSearchControl::depth(depth)),
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
                log::debug!("{}", message.serialize());

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
    pub variation_number: u16,
    pub cp: i32,
    pub uci_move: Uci,
}

/// Returns variations if attributes contain an evaluation.
fn attributes_to_eval(attributes: &[UciInfoAttribute]) -> Option<RawVariation> {
    let mut is_seldepth = false;
    let mut variation_number: Option<u16> = None;
    let mut cp: Option<i32> = None;
    let mut uci_move: Option<Uci> = None;

    for attribute in attributes {
        match attribute {
            UciInfoAttribute::SelDepth(_) => is_seldepth = true,
            UciInfoAttribute::MultiPv(n) => variation_number = Some(*n),
            UciInfoAttribute::Score {
                cp: score_cp, mate, ..
            } => {
                if mate.is_some() {
                    panic!("stockfish is giving a mate evaluation!")
                }
                cp = Some(score_cp.unwrap());
            }
            UciInfoAttribute::Pv(moves) => {
                uci_move = Some(vampirc_to_shakmaty(&moves[0]));
            }
            _ => {}
        }
    }

    if is_seldepth {
        Some(RawVariation {
            variation_number: variation_number.unwrap(),
            cp: cp.unwrap(),
            uci_move: uci_move.unwrap(),
        })
    } else {
        None
    }
}

fn vampirc_to_shakmaty(uci_move: &UciMove) -> Uci {
    fn convert_square(square: &UciSquare) -> Square {
        (
            File::from_char(square.file).unwrap(),
            *Rank::ALL.get(square.rank as usize - 1).unwrap(),
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
