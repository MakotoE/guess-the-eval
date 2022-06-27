use super::*;
use pgn_reader::{RawHeader, Visitor};
use shakmaty::san::SanPlus;
use shakmaty::Chess;

#[derive(Debug)]
pub struct PositionsVisitor {
    positions: Vec<Chess>,
    players: Players,
    error: Option<Error>,
}

impl PositionsVisitor {
    pub fn new() -> Self {
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
