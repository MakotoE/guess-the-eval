import React from 'react';

export default (): React.ReactElement => (
  <div style={{ display: 'flex', flexDirection: 'row' }}>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          width: '10px',
          height: '244px',
          backgroundColor: '#e3e3e3',
          borderStyle: 'solid',
          borderColor: '#161616',
          borderWidth: '1px',
          borderBottomStyle: 'none',
        }}
      />
      <div
        style={{
          width: '24px',
          height: '12px',
          backgroundColor: '#161616',
          borderStyle: 'solid',
          borderColor: '#e3e3e3',
          borderWidth: '1px',
        }}
      />
      <div
        style={{
          width: '10px',
          height: '244px',
          backgroundColor: '#161616',
          borderStyle: 'solid',
          borderColor: '#e3e3e3',
          borderWidth: '1px',
          borderTopStyle: 'none',
        }}
      />
    </div>
    <div
      style={{
        marginTop: '240px',
        marginLeft: '10px',
        fontSize: '2em',
      }}
    >
      <div
        style={{
          height: '20px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <p>
          +0.00
        </p>
      </div>
    </div>
  </div>
);
