import { Config } from 'chessground/config';
import React from 'react';
import { Chess, SQUARES } from 'chess.ts';
import { Key } from 'chessground/types';
import Chessground from './chessground';
import EvalBar from './EvalBar';

interface Props {
  value: BoardAndBarState,
  onChange: (input: BoardAndBarState) => void;
}

export interface BoardAndBarState {
  initialFEN: string,
  playMove: string | null,
  eval: number
}

function getDestinations(chess: Chess): Map<Key, Key[]> {
  const result = new Map<Key, Key[]>();

  Object.keys(SQUARES).forEach((s) => {
    const moves = chess.moves({ square: s, verbose: true });
    result.set(s as Key, moves.map((m) => m.to as Key));
  });
  return result;
}

export default ({ value, onChange }: Props): React.ReactElement => {
  const chess = new Chess(value.initialFEN);
  const turn = chess.turn() === 'w' ? 'white' : 'black';
  if (value.playMove !== null) {
    if (chess.move(value.playMove) === null) {
      throw new Error(`illegal move: ${value.playMove}`);
    }
  }

  const config: Config = {
    fen: chess.fen(),
    orientation: turn,
    turnColor: turn,
    movable: {
      dests: getDestinations(chess),
      color: turn,
      showDests: true,
      free: false,
    },
    events: {
      move: (origin, destination) => {
        const move = chess.move({ from: origin, to: destination }, { dry_run: true });
        if (move === null) {
          throw new Error(`illegal move: ${origin}, ${destination}`);
        }

        onChange({ ...value, playMove: move.san });
      },
    },
    selectable: {
      enabled: false,
    },
    coordinates: false,
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '104px' }} />
      <Chessground
        config={config}
        width={Math.min(500, document.documentElement.clientWidth)}
        height={Math.min(500, document.documentElement.clientWidth)}
      />
      <EvalBar />
    </div>
  );
};
