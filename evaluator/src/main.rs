use anyhow::Result;
use std::process::Stdio;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader, Lines};
use tokio::process::{ChildStdin, ChildStdout, Command};
use tokio::sync::Notify;
use vampirc_uci::{parse_one, Serializable, UciFen, UciMessage, UciSearchControl};

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

    tokio::spawn({
        let semaphore = semaphore.clone();
        async move {
            const POSITIONS: &[&str] = &[
                "3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27",
                "r1k4r/p2nb1p1/2b4p/1p1n1p2/2PP4/3Q1NB1/1P3PPP/R5K1 b - - 0 19",
                "5q1k/ppp2Nbp/2np2p1/3B1b2/2PP4/4r1P1/PP1Q3P/R5K1 b - - 3 18",
                "r3r1k1/pp3pbp/1qp1b1p1/2B5/2BP4/Q1n2N2/P4PPP/3R1K1R w - - 4 18",
                "rnbq1bnr/ppppkppp/8/4p3/4P3/8/PPPPKPPP/RNBQ1BNR w - - 2 3",
            ];

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
                eprintln!("error: {}", e);
            }
        }
    });

    let mut stdin = BufReader::new(child.stdout.take().unwrap()).lines();

    for _ in 0..5 {
        read_all(&mut stdin).await?;
        semaphore.notify_one();
    }

    child.wait().await.unwrap();
    Ok(())
}

async fn read_all(stdin: &mut Lines<BufReader<ChildStdout>>) -> Result<()> {
    loop {
        if let Some(s) = stdin.next_line().await? {
            if !s.is_empty() {
                let message = parse_one(&s);
                println!("{}", message.serialize());

                if s.starts_with("bestmove") {
                    return Ok(());
                }
            }
        }
    }
}

async fn write_message(stdin: &mut ChildStdin, message: &UciMessage) -> Result<()> {
    stdin
        .write_all((message.serialize() + "\n").as_bytes())
        .await?;
    Ok(())
}
