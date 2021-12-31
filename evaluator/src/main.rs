use std::process::Stdio;
use std::time::Duration;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::Command;
use tokio::time::sleep;

#[tokio::main]
async fn main() {
    let mut child = Command::new("./stockfish_14.1_linux_x64_avx2")
        .stdout(Stdio::piped())
        .stdin(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    let mut stdin = child.stdin.take().unwrap();
    let mut stdout = BufReader::new(child.stdout.take().unwrap()).lines();

    tokio::spawn(async move {
        stdin.write_all(b"uci\n").await.unwrap();
        stdin
            .write_all(
                b"position fen 3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27\n",
            )
            .await
            .unwrap();
        stdin.write_all(b"go depth 20\n").await.unwrap();
        sleep(Duration::from_millis(1000)).await;
    })
    .await
    .unwrap();

    while let Some(line) = stdout.next_line().await.unwrap() {
        println!("{}", line);
    }

    child.wait().await.unwrap();
}
