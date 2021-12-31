use anyhow::Result;
use std::process::Stdio;
use std::sync::Arc;
use std::time::Duration;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader, Lines};
use tokio::process::{ChildStdout, Command};
use tokio::sync::Notify;
use tokio::time::sleep;

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
            stdin.write_all(b"uci\n").await.unwrap();
            stdin
                .write_all(
                    b"position fen 3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27\n",
                )
                .await
                .unwrap();
            stdin.write_all(b"go depth 10\n").await.unwrap();
            semaphore.notified().await;
            stdin.write_all(b"quit\n").await.unwrap();
        }
    });

    let mut stdin = BufReader::new(child.stdout.take().unwrap()).lines();
    read_all(&mut stdin).await?;
    semaphore.notify_one();

    child.wait().await.unwrap();
    Ok(())
}

async fn read_all(stdin: &mut Lines<BufReader<ChildStdout>>) -> Result<()> {
    loop {
        if let Some(s) = stdin.next_line().await? {
            println!("{}", s);

            if s.starts_with("bestmove") {
                return Ok(());
            }
        }
    }
}
