import { Config } from 'chessground/config';
import React from 'react';
import { Chess } from 'chess.ts';
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

export default ({ value, onChange }: Props): React.ReactElement => {
  const chess = new Chess(value.initialFEN);
  const turn = chess.turn();
  if (value.playMove !== null) {
    if (chess.move(value.playMove) === null) {
      throw new Error(`illegal move: ${value.playMove}`);
    }
  }

  const config: Config = {
    fen: chess.fen(),
    orientation: turn === 'w' ? 'white' : 'black',
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
