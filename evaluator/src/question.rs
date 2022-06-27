use super::*;
use serde::{Serialize, Serializer};
use shakmaty::fen::Fen;
use shakmaty::san::San;
use shakmaty::{CastlingMode, Chess, Color, FromSetup};

#[derive(Debug, Clone, Serialize)]
pub struct Question {
    pub fen: SerializableFen,
    pub players: Players,
    pub moves: Moves,
    pub pgn: String,
    pub turn_number: usize,
}

#[derive(Debug, Clone, Serialize)]
pub struct Moves {
    pub one: Move,
    pub two: Option<Move>,
    pub three: Option<Move>,
}

#[derive(Debug, Default, PartialEq, Eq, Clone, Serialize)]
pub struct Players {
    pub white: String,
    pub black: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Move {
    #[serde(rename = "move")]
    pub move_: SerializableSan,
    pub evaluation: f32,
}

impl Move {
    pub fn from_variation(eval_and_move: &EvalAndMove, fen: &Fen) -> Result<Move> {
        let position = Chess::from_setup(fen.as_setup().clone(), CastlingMode::Standard)?;
        let san = San::from_move(&position, &eval_and_move.uci_move.to_move(&position)?);

        let evaluation = eval_and_move.cp as f32
            * match position.turn() {
                Color::White => 1.0,
                Color::Black => -1.0,
            }
            / 100.0;

        Ok(Move {
            move_: SerializableSan(san),
            evaluation,
        })
    }
}

#[derive(Debug, Clone)]
pub struct SerializableFen(pub Fen);

impl Serialize for SerializableFen {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.collect_str(&self.0)
    }
}

#[derive(Debug, Clone)]
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
    use shakmaty::fen::Fen;
    use shakmaty::{CastlingMode, Chess, Move, Role, Square};

    #[test]
    fn test_serializable_san() {
        let position: Chess =
            Fen::from_ascii(b"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
                .unwrap()
                .into_position(CastlingMode::Standard)
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
