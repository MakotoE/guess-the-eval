import React from 'react';
import { Container, Header } from 'semantic-ui-react';
import { Config } from 'chessground/config';
import BoardAndBar from './BoardAndBar';

export default (): React.ReactElement => {
  const boardConfig: Config = {
    fen: '3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27',
    orientation: 'black',
    coordinates: false,
    draggable: {
      enabled: false,
    },
    selectable: {
      enabled: false,
    },
  };

  return (
    <Container fluid textAlign="center">
      <div style={{ display: 'inline-block', marginBottom: '20px' }}>
        <Header as="h1" style={{ marginBottom: '-14px' }}><i>Guess the Eval</i></Header>
        <p style={{ textAlign: 'left' }}>Question 1/5</p>
      </div>
      <Container textAlign="center">
        <BoardAndBar config={boardConfig} />
        <p>Black to play.</p>
        <Header as="h2">What do you think the eval is? (Slide the eval bar on the right)</Header>
      </Container>
    </Container>
  );
};
