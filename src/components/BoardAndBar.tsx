import { Config } from 'chessground/config';
import React, { useEffect, useState } from 'react';
import { Chess, SQUARES } from 'chess.ts';
import { Key } from 'chessground/types';
import * as cg from 'chessground/src/types';
import { defaults } from 'chessground/state';
import Chessground from './Chessground';
import EvalSlider from './EvalSlider';

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

const brushes = {
  ...defaults().drawable.brushes,
  green: {
    key: 'g',
    color: '#0678bd',
    opacity: 1,
    lineWidth: 11,
  },
};

export default ({ value, onChange }: Props): React.ReactElement => {
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    document.onkeydown = (event) => {
      if (event.key === 'ArrowLeft') {
        onChange({ ...value, playMove: null });
      }
    };
  }, [onChange, value]);

  const chess = new Chess(value.initialFEN);
  const turn = chess.turn() === 'w' ? 'white' : 'black';
  if (value.playMove !== null) {
    if (chess.move(value.playMove) === null) {
      throw new Error(`illegal move: ${value.playMove}`);
    }
  }

  const onMove = (origin: cg.Key, destination: cg.Key) => {
    const move = chess.move({ from: origin, to: destination }, { dry_run: true });
    if (move === null) {
      throw new Error(`illegal move: ${origin}, ${destination}`);
    }

    onChange({ ...value, playMove: move.san });
  };

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
      move: onMove,
    },
    selectable: {
      enabled: false,
    },
    coordinates: false,
    drawable: {
      brushes,
    },
  };

  const length = Math.min(500, document.documentElement.clientWidth);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '104px' }} />
      <Chessground config={config} style={{ width: length, height: length }} />
      <EvalSlider value={sliderValue} onChange={setSliderValue} />
    </div>
  );
};
