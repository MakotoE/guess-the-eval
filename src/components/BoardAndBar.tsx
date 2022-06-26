import { Config } from 'chessground/config';
import React, { useEffect, useRef, useState } from 'react';
import { Chess, SQUARES } from 'chess.ts';
import { Key } from 'chessground/types';
import * as cg from 'chessground/src/types';
import { defaults } from 'chessground/state';
import { Button } from 'semantic-ui-react';
import { DrawShape } from 'chessground/draw';
import Chessground from './Chessground';
import EvalSliderDesktop from './EvalSliderDesktop';
import EvalSliderMobile from './EvalSliderMobile';

interface Props {
  value: BoardAndBarState,
  onChange: (input: BoardAndBarState) => void,
  // If true, user cannot change any values
  disabled: boolean,
  // Arrows to draw on board.
  shapes: Arrow[],
}

export type Arrow = (DrawShape & { opacity: number });

export interface BoardAndBarState {
  initialFEN: string,
  // Move to play. Null if no move is played.
  playMove: string | null,
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

export default ({
  value, onChange, disabled, shapes,
}: Props): React.ReactElement => {
  const chess = new Chess(value.initialFEN);
  const turn = chess.turn();
  if (value.playMove !== null) {
    if (chess.move(value.playMove) === null) {
      throw new Error(`illegal move: ${value.playMove}`);
    }
  }

  const rootElement = useRef<HTMLDivElement>(null);
  const [length, setLength] = useState(0);
  useEffect(() => {
    if (rootElement && rootElement.current) {
      setLength(Math.min(500, rootElement.current.offsetWidth - 40));
    }
  }, [rootElement]);

  const brushes = {
    ...defaults().drawable.brushes,
    green: {
      key: 'g',
      color: '#0678bd',
      opacity: 1,
      lineWidth: 11,
    },
    paleGreen: {
      key: 'pg', color: '#15781B', opacity: shapes[0] ? shapes[0].opacity : 0, lineWidth: 10,
    },
    yellow: {
      key: 'y', color: '#18791e', opacity: shapes[1] ? shapes[1].opacity : 0, lineWidth: 10,
    },
    paleRed: {
      key: 'pr', color: '#1d7a23', opacity: shapes[2] ? shapes[2].opacity : 0, lineWidth: 10,
    },
  };

  const onMove = (origin: cg.Key, destination: cg.Key) => {
    const move = chess.move({ from: origin, to: destination }, { dry_run: true });
    if (move === null) {
      throw new Error(`illegal move: ${origin}, ${destination}`);
    }

    onChange({ ...value, playMove: move.san });
  };

  const color = turn === 'w' ? 'white' : 'black';
  const config: Config = {
    fen: chess.fen(),
    orientation: color,
    turnColor: color,
    movable: {
      dests: getDestinations(chess),
      color,
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
      autoShapes: shapes,
    },
  };

  return (
    <div ref={rootElement}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Chessground config={config} style={{ width: length, height: length }} />
          <EvalSliderMobile
            value={value.sliderValue}
            onDrag={(sliderValue) => onChange({ ...value, sliderValue })}
            orientation={turn}
            disabled={disabled}
            width={length}
          />
        </div>
        <EvalSliderDesktop
          value={value.sliderValue}
          onDrag={(sliderValue) => onChange({ ...value, sliderValue })}
          orientation={turn}
          disabled={disabled}
          height={length}
        />
      </div>
      {
        value.playMove === null || disabled
          ? null
          : (
            <Button
              onClick={() => onChange({ ...value, playMove: null })}
              compact
              size="tiny"
              inverted
            >
              Undo move
            </Button>
          )
      }
    </div>
  );
};
