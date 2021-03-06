import React from 'react';
import Draggable from 'react-draggable';
import { Color } from 'chess.ts';

export function sliderValueToEval(value: number): number {
  return 20 * value ** 3;
}

export function evalOutput(value: number): string {
  const evaluation = sliderValueToEval(value);
  if (evaluation >= 0) {
    return `+${evaluation.toFixed(2)}`;
  }

  return evaluation.toFixed(2);
}

export const WHITE_COLOR = '#e3e3e3';
export const BLACK_COLOR = '#161616';

interface Props {
  // From -1.0 to 1.0
  value: number;
  onDrag: (value: number) => void;
  orientation: Color;
  disabled: boolean;
  height: number;
}

export default ({
  value, onDrag, orientation, disabled, height,
}: Props): React.ReactElement => {
  const sliderWidth = 24;
  const sliderHeight = 12;
  const barWidth = 10;
  const valueCoefficient = orientation === 'w' ? -1 : 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            position: 'absolute',
            width: `${barWidth}px`,
            height: `${height}px`,
            backgroundColor: orientation === 'w' ? WHITE_COLOR : BLACK_COLOR,
            borderStyle: 'solid',
            borderColor: orientation === 'w' ? BLACK_COLOR : WHITE_COLOR,
            borderWidth: '1px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: `${barWidth}px`,
            height: `${(height / 2) * (1 + value * valueCoefficient)}px`,
            backgroundColor: orientation === 'w' ? BLACK_COLOR : WHITE_COLOR,
            borderStyle: 'solid',
            borderColor: orientation === 'w' ? WHITE_COLOR : BLACK_COLOR,
            borderWidth: '1px',
          }}
        />
      </div>
      <Draggable
        axis="y"
        bounds={{
          top: -(height / 2 - sliderHeight / 2),
          bottom: (height / 2 - sliderHeight / 2),
        }}
        position={{ x: 0, y: (value * valueCoefficient) * (height / 2 - sliderHeight / 2) }}
        onDrag={(_, data) => {
          onDrag((data.y / (height / 2 - sliderHeight / 2)) * valueCoefficient);
        }}
        disabled={disabled}
      >
        <div
          style={{
            position: 'absolute',
            top: `${height / 2 - sliderHeight / 2}px`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: `${sliderWidth}px`,
              height: `${sliderHeight}px`,
              backgroundColor: orientation === 'w' ? WHITE_COLOR : BLACK_COLOR,
              borderStyle: 'solid',
              borderColor: orientation === 'w' ? BLACK_COLOR : WHITE_COLOR,
              borderWidth: '1px',
              cursor: disabled ? '' : 'ns-resize',
            }}
          />
          <div
            style={{
              height: 0,
              position: 'absolute',
              left: `${sliderWidth + 5}px`,
              top: `${sliderHeight / 2}px`,
              display: 'flex',
              alignItems: 'center',
              cursor: disabled ? '' : 'ns-resize',
            }}
          >
            <p style={{ fontSize: '2em' }}>
              {evalOutput(value)}
            </p>
          </div>
        </div>
      </Draggable>
    </div>
  );
};
