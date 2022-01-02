use super::*;
use serde::{Serialize, Serializer};
use shakmaty::fen::Fen;
use shakmaty::san::San;
use shakmaty::{CastlingMode, Chess, Color, FromSetup, Setup};

#[derive(Debug, Serialize)]
pub struct Question {
    pub fen: SerializableFen,
    pub variations: Vec<Variation>,
}

#[derive(Debug, Serialize)]
pub struct Variation {
    #[serde(rename = "move")]
    pub move_: SerializableSan,
    pub evaluation: f32,
}

impl Variation {
    pub fn from_raw_variation(raw: &RawVariation, fen: &Fen) -> Result<Variation> {
        let position = Chess::from_setup(fen, CastlingMode::Standard)?;
        let san = San::from_move(&position, &raw.uci_move.to_move(&position)?);

        let evaluation = raw.cp as f32
            * match position.turn() {
                Color::White => 1.0,
                Color::Black => -1.0,
            }
            / 100.0;

        Ok(Variation {
            move_: SerializableSan(san),
            evaluation,
        })
    }
}

#[derive(Debug)]
pub struct SerializableFen(pub Fen);

impl Serialize for SerializableFen {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.collect_str(&self.0)
    }
}

#[derive(Debug)]
pub struct SerializableSan(pub San);

impl Serialize for SerializableSan {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.collect_str(&self.0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use pgn_reader::Square;
    use shakmaty::fen::Fen;
    use shakmaty::{CastlingMode, Chess, Move, Role, Square};

    #[test]
    fn test_serializable_san() {
        let position: Chess =
            Fen::from_ascii(b"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
                .unwrap()
                .position(CastlingMode::Standard)
                .unwrap();
        let m = Move::Normal {
            role: Role::Knight,
            from: Square::B1,
            to: Square::C3,
            capture: None,
            promotion: None,
        };

        let san = SerializableSan(San::from_move(&position, &m));
        assert_eq!(serde_json::to_string(&san).unwrap(), r#""Nc3""#);
    }
}
