import React, { useState } from 'react';
import {
  Container, Form, Header, Input,
} from 'semantic-ui-react';
import BoardAndBar, { BoardAndBarState } from './BoardAndBar';

enum State {
  evaluation,
  bestMove,
  player,
}

export default (): React.ReactElement => {
  const [boardAndBar, setBoardAndBar] = useState({
    eval: 0,
    initialFEN:
      '3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27',
    playMove: null,
  } as BoardAndBarState);

  const [player, setPlayer] = useState('');
  const [currentState, setCurrentState] = useState(State.player);

  let questionText = null;
  switch (currentState) {
    case State.evaluation:
      questionText = <Header as="h2">What do you think the eval is? (Slide the eval bar on the right)</Header>;
      break;
    case State.bestMove:
      questionText = <Header as="h2">What is the best move for black?</Header>;
      break;
    case State.player:
      questionText = (
        <Form>
          <Header as="h2">Who played in this game?</Header>
          <Input
            value={player}
            onChange={(_, data) => setPlayer(data.value)}
            size="large"
            spellCheck={false}
            focus
          />
        </Form>
      );
      break;
    default:
      throw new Error('unreachable');
  }

  return (
    <Container fluid textAlign="center">
      <div style={{ display: 'inline-block', marginBottom: '20px' }}>
        <Header as="h1" style={{ marginBottom: '-14px' }}><i>Guess the Eval</i></Header>
        <p style={{ textAlign: 'left' }}>Question 1/5</p>
      </div>
      <Container textAlign="center">
        <BoardAndBar
          value={boardAndBar}
          onChange={(value) => {
            setBoardAndBar(value);
            setCurrentState((state) => state + 1);
          }}
        />
        <p>Black to play.</p>
        {questionText}
      </Container>
    </Container>
  );
};
