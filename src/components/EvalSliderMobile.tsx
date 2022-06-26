import { Color } from 'chess.ts';
import React from 'react';
import Draggable from 'react-draggable';
import { BLACK_COLOR, evalOutput, WHITE_COLOR } from './EvalSliderDesktop';

interface Props {
  // From -1.0 to 1.0
  value: number;
  onDrag: (value: number) => void;
  orientation: Color;
  disabled: boolean;
  width: number;
}

export default ({
  value, onDrag, orientation, disabled, width,
}: Props): React.ReactElement => {
  const sliderWidth = 20;
  const sliderHeight = 28;
  const barHeight = 10;
  const valueCoefficient = orientation === 'w' ? -1 : 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        height: 60,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            position: 'absolute',
            width: `${width}px`,
            height: `${barHeight}px`,
            backgroundColor: orientation === 'w' ? WHITE_COLOR : BLACK_COLOR,
            borderStyle: 'solid',
            borderColor: orientation === 'w' ? BLACK_COLOR : WHITE_COLOR,
            borderWidth: '1px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            height: `${barHeight}px`,
            width: `${(width / 2) * (1 + value * valueCoefficient)}px`,
            backgroundColor: orientation === 'w' ? BLACK_COLOR : WHITE_COLOR,
            borderStyle: 'solid',
            borderColor: orientation === 'w' ? WHITE_COLOR : BLACK_COLOR,
            borderWidth: '1px',
          }}
        />
      </div>
      <Draggable
        axis="x"
        bounds={{
          left: -(width / 2 - sliderWidth / 2),
          right: (width / 2 - sliderWidth / 2),
        }}
        position={{ x: (value * valueCoefficient) * (width / 2 - sliderWidth / 2), y: 0 }}
        onDrag={(_, data) => {
          onDrag((data.x / (width / 2 - sliderWidth / 2)) * valueCoefficient);
        }}
        disabled={disabled}
      >
        <div
          style={{
            position: 'absolute',
            left: `${width / 2 - sliderWidth / 2}px`,
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
              cursor: disabled ? '' : 'ew-resize',
            }}
          />
          <div
            style={{
              height: 0,
              position: 'absolute',
              left: `${sliderWidth / 2 - 50}px`,
              top: `${sliderHeight + 18}px`,
              display: 'flex',
              alignItems: 'center',
              cursor: disabled ? '' : 'ew-resize',
            }}
          >
            <p style={{ width: 100, fontSize: '2em', textAlign: 'center' }}>
              {evalOutput(value)}
            </p>
          </div>
        </div>
      </Draggable>
    </div>
  );
};
