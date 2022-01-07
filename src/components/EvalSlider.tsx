import React, { useRef } from 'react';
import Draggable from 'react-draggable';

export function sliderValueToEval(value: number): number {
  return 20 * value ** 2;
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
}

export default ({ value, onChange }: Props): React.ReactElement => {
  const rootRef = useRef(null);

  const totalHeight = 500;
  const sliderWidth = 24;
  const sliderHeight = 12;
  const barWidth = 10;

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
            width: `${barWidth}px`,
            height: `${(totalHeight / 2) * (1 + value)}px`,
            backgroundColor: '#e3e3e3',
            borderStyle: 'solid',
            borderColor: '#161616',
            borderWidth: '1px',
            borderTopWidth: value === -1 ? 0 : 1,
            borderBottomWidth: value === -1 ? 0 : 1,
          }}
        />
        <div
          style={{
            width: `${barWidth}px`,
            height: `${(totalHeight / 2) * (1 - value)}px`,
            backgroundColor: '#161616',
            borderStyle: 'solid',
            borderColor: '#e3e3e3',
            borderWidth: '1px',
            borderTopWidth: value === 1 ? 0 : 1,
            borderBottomWidth: value === 1 ? 0 : 1,
          }}
        />
      </div>
      <Draggable
        axis="y"
        bounds={{
          top: -(totalHeight / 2 - sliderHeight / 2),
          bottom: (totalHeight / 2 - sliderHeight / 2),
        }}
        position={{ x: 0, y: value * (totalHeight / 2 - sliderHeight / 2) }}
        onDrag={(e, data) => {
          onChange(data.y / (totalHeight / 2 - sliderHeight / 2));
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
              width: `${sliderWidth}px`,
              height: `${sliderHeight}px`,
              backgroundColor: '#161616',
              borderStyle: 'solid',
              borderColor: '#e3e3e3',
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
