import React, { useRef, useState } from 'react';
import Draggable from 'react-draggable';

export default (): React.ReactElement => {
  // From -1.0 to 1.0
  const [sliderValue, setSliderValue] = useState(0);
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
            height: `${(totalHeight / 2) * (1 + sliderValue)}px`,
            backgroundColor: '#e3e3e3',
            borderStyle: 'solid',
            borderColor: '#161616',
            borderWidth: '1px',
            borderTopWidth: sliderValue === -1 ? 0 : 1,
            borderBottomWidth: sliderValue === -1 ? 0 : 1,
          }}
        />
        <div
          style={{
            width: `${barWidth}px`,
            height: `${(totalHeight / 2) * (1 - sliderValue)}px`,
            backgroundColor: '#161616',
            borderStyle: 'solid',
            borderColor: '#e3e3e3',
            borderWidth: '1px',
            borderTopWidth: sliderValue === 1 ? 0 : 1,
            borderBottomWidth: sliderValue === 1 ? 0 : 1,
          }}
        />
      </div>
      <Draggable
        axis="y"
        bounds={{
          top: -(totalHeight / 2 - sliderHeight / 2),
          bottom: (totalHeight / 2 - sliderHeight / 2),
        }}
        position={{ x: 0, y: sliderValue * (totalHeight / 2 - sliderHeight / 2) }}
        onDrag={(e, data) => {
          setSliderValue(data.y / (totalHeight / 2 - sliderHeight / 2));
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
              +0.00
            </p>
          </div>
        </div>
      </Draggable>
    </div>
  );
};
