mod question;

use crate::question::*;
use anyhow::Result;
use shakmaty::fen::Fen;
use shakmaty::san::San;
use shakmaty::uci::Uci;
use shakmaty::{CastlingMode, Chess, Color, File, FromSetup, Rank, Role, Setup, Square};
use std::process::Stdio;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader, Lines};
use tokio::process::{ChildStdin, ChildStdout, Command};
use tokio::sync::Notify;
use vampirc_uci::{
    parse_one, Serializable, UciFen, UciInfoAttribute, UciMessage, UciMove, UciSearchControl,
    UciSquare,
};

#[tokio::main]
async fn main() -> Result<()> {
    let mut child = Command::new("./stockfish_14.1_linux_x64_avx2")
        .stdout(Stdio::piped())
        .stdin(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    let semaphore = Arc::new(Notify::new());

    let mut stdin = child.stdin.take().unwrap();

    const POSITIONS: &[&str] = &[
        "3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27",
        "r1k4r/p2nb1p1/2b4p/1p1n1p2/2PP4/3Q1NB1/1P3PPP/R5K1 b - - 0 19",
        "5q1k/ppp2Nbp/2np2p1/3B1b2/2PP4/4r1P1/PP1Q3P/R5K1 b - - 3 18",
        "r3r1k1/pp3pbp/1qp1b1p1/2B5/2BP4/Q1n2N2/P4PPP/3R1K1R w - - 4 18",
        "rnbq1bnr/ppppkppp/8/4p3/4P3/8/PPPPKPPP/RNBQ1BNR w - - 2 3",
    ];

    tokio::spawn({
        let semaphore = semaphore.clone();
        async move {
            let result: Result<()> = async {
                write_message(&mut stdin, &UciMessage::Uci).await?;

                for &position in POSITIONS {
                    let position_msg = UciMessage::Position {
                        startpos: false,
                        fen: Some(UciFen::from(position)),
                        moves: vec![],
                    };
                    write_message(&mut stdin, &position_msg).await?;

                    let go_msg = UciMessage::Go {
                        time_control: None,
                        search_control: Some(UciSearchControl::depth(10)),
                    };
                    write_message(&mut stdin, &go_msg).await?;
                    stdin.flush().await?;
                    semaphore.notified().await;
                }

                write_message(&mut stdin, &UciMessage::Quit).await?;
                Ok(())
            }
            .await;
            if let Err(e) = result {
                panic!("error: {}", e);
            }
        }
    });

    let mut stdin = BufReader::new(child.stdout.take().unwrap()).lines();

    for position in POSITIONS {
        let best_move = read_all_evals(&mut stdin).await?;
        semaphore.notify_one();
        let fen = Fen::from_ascii(position.as_bytes())?;
        let position = Chess::from_setup(&fen, CastlingMode::Standard)?;
        let san = San::from_move(&position, &best_move.best_move.to_move(&position)?);

        let evaluation = best_move.cp as f32
            * match position.turn() {
                Color::White => 1.0,
                Color::Black => -1.0,
            }
            / 100.0;

        let variation = Variation {
            move_: SerializableSan(san),
            evaluation,
        };
        println!("{}", serde_json::to_string(&variation).unwrap());
    }

    child.wait().await.unwrap();
    Ok(())
}

async fn read_all_evals(stdin: &mut Lines<BufReader<ChildStdout>>) -> Result<RawVariation> {
    let mut last_eval: Option<RawVariation> = None;
    loop {
        if let Some(s) = stdin.next_line().await? {
            if !s.is_empty() {
                let message = parse_one(&s);
                println!("{}", message.serialize());

                match message {
                    UciMessage::Info(attributes) => {
                        if let Some(eval) = attributes_to_eval(&attributes) {
                            last_eval = Some(eval);
                        }
                    }
                    UciMessage::BestMove { .. } => {
                        return Ok(last_eval.unwrap());
                    }
                    _ => {}
                }
            }
        }
    }
}

struct RawVariation {
    cp: i32,
    best_move: Uci,
}

fn attributes_to_eval(attributes: &[UciInfoAttribute]) -> Option<RawVariation> {
    let mut cp: Option<i32> = None;
    let mut best_move: Option<Uci> = None;

    for attribute in attributes {
        match attribute {
            UciInfoAttribute::Score { cp: score_cp, .. } => {
                cp = Some(score_cp.unwrap());
            }
            UciInfoAttribute::Pv(moves) => {
                best_move = Some(vampirc_to_shakmaty(&moves[0]));
            }
            _ => {}
        }
    }

    if let Some(cp) = cp {
        if let Some(best_move) = best_move {
            Some(RawVariation { cp, best_move })
        } else {
            None
        }
    } else {
        None
    }
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
