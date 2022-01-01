use pgn_reader::San;
use serde::{Serialize, Serializer};

pub type BestMoves = Vec<Variation>;

#[derive(Debug, Serialize)]
pub struct Variation {
    #[serde(rename = "move")]
    pub move_: SerializableSan,
    pub evaluation: f32,
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
    use shakmaty::{CastlingMode, Chess, Move, Role};

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
