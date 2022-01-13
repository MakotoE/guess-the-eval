import React, { useState } from 'react';
import {
  Button, Container, Header, Input,
} from 'semantic-ui-react';
import BoardAndBar, { BoardAndBarState } from './BoardAndBar';

enum State {
  evaluation,
  bestMove,
  player,
  summary,
}

export default (): React.ReactElement => {
  const [boardAndBar, setBoardAndBar] = useState({
    sliderValue: 0,
    initialFEN:
      '3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27',
    playMove: null,
  } as BoardAndBarState);
  const [player, setPlayer] = useState('');
  const [currentState, setCurrentState] = useState(State.evaluation);

  let questionText = null;
  switch (currentState) {
    case State.evaluation:
      questionText = (
        <Header as="h2">
          What do you think the eval is? (Slide the eval bar on the right)
        </Header>
      );
      break;
    case State.bestMove:
      questionText = <Header as="h2">What is the best move for black?</Header>;
      break;
    case State.player:
      questionText = (
        <>
          <Header as="h2">Who played in this game?</Header>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Input
              value={player}
              onChange={(_, data) => setPlayer(data.value)}
              size="large"
              spellCheck={false}
              inverted
              autoFocus
            />
            <div style={{ width: '10px' }} />
            <Button size="large" inverted>Submit answer</Button>
          </div>
        </>
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
            if (player === '' && value.playMove !== null) {
              setCurrentState(State.player);
            } else if (value.sliderValue !== 0) {
              setCurrentState(State.bestMove);
            }
          }}
        />
        {questionText}
      </Container>
    </Container>
  );
};
