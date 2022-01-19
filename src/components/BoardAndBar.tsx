import { Config } from 'chessground/config';
import React from 'react';
import { Chess, SQUARES } from 'chess.ts';
import { Key } from 'chessground/types';
import * as cg from 'chessground/src/types';
import { defaults } from 'chessground/state';
import { Button } from 'semantic-ui-react';
import Chessground from './Chessground';
import EvalSlider from './EvalSlider';

interface Props {
  value: BoardAndBarState,
  onChange: (input: BoardAndBarState) => void,
  // If true, user cannot change any values
  disabled: boolean,
}

export interface BoardAndBarState {
  initialFEN: string,
  playMove: string,
  // From -1.0 to 1.0. Use sliderValueToEval() to convert to eval.
  sliderValue: number,
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

export default ({ value, onChange, disabled }: Props): React.ReactElement => {
  const chess = new Chess(value.initialFEN);
  const turn = chess.turn() === 'w' ? 'white' : 'black';
  if (value.playMove !== '') {
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
      showDests: !disabled,
      free: false,
    },
    events: {
      move: onMove,
    },
    draggable: {
      enabled: !disabled,
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
    <>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Chessground config={config} style={{ width: length, height: length }} />
        <EvalSlider
          onStop={(sliderValue) => onChange({ ...value, sliderValue })}
          orientation="b"
          disabled={disabled}
        />
      </div>
      <p style={{ marginBottom: '4px' }}>
        Black to play
      </p>
      {
        value.playMove === '' || disabled
          ? null
          : (
            <Button
              onClick={() => onChange({ ...value, playMove: '' })}
              compact
              size="tiny"
              inverted
            >
              Undo move
            </Button>
          )
      }
    </>
  );
};
