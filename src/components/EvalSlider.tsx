import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { Color } from 'chess.ts';

export function sliderValueToEval(value: number): number {
  return 20 * value ** 3;
}

function evalOutput(value: number): string {
  const evaluation = sliderValueToEval(value);
  if (evaluation >= 0) {
    return `+${evaluation.toFixed(2)}`;
  }

  return evaluation.toFixed(2);
}

interface Props {
  // From -1.0 to 1.0
  value: number;
  onChange: (value: number) => void;
  orientation: Color;
}

export default ({ value, onChange, orientation }: Props): React.ReactElement => {
  const rootRef = useRef(null);

  const totalHeight = 500;
  const sliderWidth = 24;
  const sliderHeight = 12;
  const barWidth = 10;
  const white = '#e3e3e3';
  const black = '#161616';
  const valueCoefficient = orientation === 'w' ? -1 : 1;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
      }}
      ref={rootRef}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            position: 'absolute',
            width: `${barWidth}px`,
            height: `${totalHeight}px`,
            backgroundColor: orientation === 'w' ? white : black,
            borderStyle: 'solid',
            borderColor: orientation === 'w' ? black : white,
            borderWidth: '1px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: `${barWidth}px`,
            height: `${(totalHeight / 2) * (1 + value * valueCoefficient)}px`,
            backgroundColor: orientation === 'w' ? black : white,
            borderStyle: 'solid',
            borderColor: orientation === 'w' ? white : black,
            borderWidth: '1px',
          }}
        />
      </div>
      <Draggable
        axis="y"
        bounds={{
          top: -(totalHeight / 2 - sliderHeight / 2),
          bottom: (totalHeight / 2 - sliderHeight / 2),
        }}
        position={{ x: 0, y: (value * valueCoefficient) * (totalHeight / 2 - sliderHeight / 2) }}
        onDrag={(e, data) => {
          onChange((data.y / (totalHeight / 2 - sliderHeight / 2)) * valueCoefficient);
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: `${totalHeight / 2 - sliderHeight / 2}px`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: `${sliderWidth}px`,
              height: `${sliderHeight}px`,
              backgroundColor: orientation === 'w' ? white : black,
              borderStyle: 'solid',
              borderColor: orientation === 'w' ? black : white,
              borderWidth: '1px',
              cursor: 'ns-resize',
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
              cursor: 'ns-resize',
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
