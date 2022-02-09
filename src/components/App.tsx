import React, { useState } from 'react';
import {
  Button, Container, Form, Header, Input,
} from 'semantic-ui-react';
import BoardAndBar, { BoardAndBarState } from './BoardAndBar';
import LastResult from './LastResult';
import { Question, questions } from '../questions';
import { sliderValueToEval } from './EvalSlider';
import { Answer, PointsSolver } from '../PointsSolver';

enum State {
  evaluation,
  bestMove,
  player,
  result,
}

function totalPoints(questionsArr: Question[], answers: Answer[]): number {
  if (answers.length === 0) {
    return 0;
  }

  return answers.map(
    (answer, index) => new PointsSolver({ question: questionsArr[index], answer }).totalPoints(),
  ).reduce((previous, current) => previous + current);
}

function randomNumber(endExclusive: number): number {
  return Math.floor(Math.random() * endExclusive);
}

const questionIndices = Array(5).fill(0).map((v, i, arr) => {
  let number = randomNumber(questions.length);
  while (arr.includes(number)) {
    number = randomNumber(questions.length);
  }
  return number;
});

export default (): React.ReactElement => {
  const [questionNumber, setQuestionNumber] = useState(0);
  const [boardAndBar, setBoardAndBar] = useState({
    sliderValue: 0,
    initialFEN: questions[questionIndices[0]].fen,
    playMove: null,
  } as BoardAndBarState);
  const [player, setPlayer] = useState('');
  const [answers, setAnswers] = useState([] as Answer[]);
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
          <Header as="h2">Who played in this game? (Last name only)</Header>
          <Form onSubmit={() => {
            const answer = {
              evaluation: sliderValueToEval(boardAndBar.sliderValue),
              bestMove: boardAndBar.playMove === null ? '' : boardAndBar.playMove,
              player,
            };
            setAnswers((state) => [...state, answer]);
            setCurrentState(State.result);
          }}
          >
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
              <Button size="large" inverted>
                Submit answer
              </Button>
            </div>
          </Form>
        </>
      );
      break;
    case State.result: {
      const lastAnswer = answers[answers.length - 1];
      if (!lastAnswer) {
        throw new Error('lastAnswer is undefined');
      }
      questionText = (
        <>
          <LastResult
            question={questions[questionIndices[questionNumber]]}
            answer={lastAnswer}
          />
          <Button
            onClick={() => {
              setQuestionNumber((n) => n + 1);
              setCurrentState(State.evaluation);
              setBoardAndBar({
                initialFEN: questions[questionIndices[questionNumber + 1]].fen,
                playMove: null,
                sliderValue: 0,
              });
            }}
            size="large"
            inverted
          >
            Okay, next
          </Button>
        </>
      );
      break;
    }
    default:
      throw new Error('unreachable');
  }

  return (
    <Container fluid textAlign="center">
      <div style={{ display: 'inline-block', marginBottom: '20px' }}>
        <Header as="h1" style={{ marginBottom: '-14px' }}><i>Guess the Eval</i></Header>
        <Header as="h2" style={{ display: 'flex' }}>
          <span style={{ flex: 1, textAlign: 'right' }}>
            Question&nbsp;
            {questionNumber + 1}
            /5
          </span>
          &nbsp;|&nbsp;
          <span style={{ flex: 1, textAlign: 'left' }}>
            {totalPoints(questions, answers).toFixed(1)}
            &nbsp;points
          </span>
        </Header>
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
          disabled={currentState === State.result}
        />
        {questionText}
      </Container>
    </Container>
  );
};
