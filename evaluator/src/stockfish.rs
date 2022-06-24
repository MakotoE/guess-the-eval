use anyhow::{Error, Result};
use shakmaty::uci::Uci;
use shakmaty::{File, Rank, Role, Square};
use std::path::Path;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader, Lines};
use tokio::process::{Child, ChildStdin, ChildStdout, Command};
use vampirc_uci::{
    parse_one, Serializable, UciFen, UciInfoAttribute, UciMessage, UciMove, UciSearchControl,
    UciSquare,
};

pub struct Stockfish {
    #[allow(dead_code)] // Child dies when dropped
    process: Child,
    stdin: ChildStdin,
    stdout: Lines<BufReader<ChildStdout>>,
    // Depth to calculate
    depth: u8,
}

impl Stockfish {
    pub async fn new(stockfish_path: &Path, depth: u8) -> Result<Self> {
        let mut child = Command::new(stockfish_path)
            .stdout(Stdio::piped())
            .stdin(Stdio::piped())
            .kill_on_drop(true)
            .spawn()?;

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

        let mut stdin = child.stdin.take().unwrap();

        for message in setup_messages {
            write_message(&mut stdin, message).await?;
        }

        Ok(Stockfish {
            stdin,
            stdout: BufReader::new(child.stdout.take().unwrap()).lines(),
            process: child,
            depth,
        })
    }

    pub async fn calculate(&mut self, position: UciFen) -> Result<[Option<RawVariation>; 3]> {
        let position_msg = UciMessage::Position {
            startpos: false,
            fen: Some(position),
            moves: vec![],
        };
        write_message(&mut self.stdin, &position_msg).await?;

        let go_msg = UciMessage::Go {
            time_control: None,
            search_control: Some(UciSearchControl::depth(self.depth)),
        };
        write_message(&mut self.stdin, &go_msg).await?;
        self.stdin.flush().await?;

        let mut variations: [Option<RawVariation>; 3] = [None, None, None];

        loop {
            let line = self
                .stdout
                .next_line()
                .await?
                .ok_or_else(|| Error::msg("expected output but did not get output"))?;

            let message = parse_one(&line);
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

#[derive(Debug, Clone)]
pub struct RawVariation {
    // Temporary
    pub evaluated_as_mate: bool,
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
                    log::info!("stockfish returned a mate eval");
                    return Some(RawVariation {
                        evaluated_as_mate: true,
                        variation_number: 1,
                        cp: 0,
                        uci_move: Uci::Null,
                    });
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
            evaluated_as_mate: false,
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
    log::debug!("write: {}", message.serialize());
    stdin
        .write_all((message.serialize() + "\n").as_bytes())
        .await?;
    Ok(())
}
