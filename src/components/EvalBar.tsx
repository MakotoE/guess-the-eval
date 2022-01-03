import React from 'react';

export default (): React.ReactElement => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{ width: '10px', height: '245px', backgroundColor: '#ffffff' }} />
    <div style={{ width: '20px', height: '10px', backgroundColor: '#000000' }} />
    <div style={{ width: '10px', height: '245px', backgroundColor: '#000000' }} />
  </div>
);
