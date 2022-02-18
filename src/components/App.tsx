import React, { useState } from 'react';
import {
  Button, Container, Divider, Form, Header, Input,
} from 'semantic-ui-react';
import { Chess } from 'chess.ts';
import { Key } from 'chessground/types';
import BoardAndBar, { BoardAndBarState, Arrow } from './BoardAndBar';
import LastResult from './LastResult';
import {
  Question, questions, Variation, Variations,
} from '../questions';
import { sliderValueToEval } from './EvalSlider';
import { Answer, PointsSolver } from '../PointsSolver';

enum State {
  evaluation,
  bestMove,
  player,
  result,
  summary,
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

const questionKeys = Array(5).fill(0).map((v, i, arr) => {
  let number = randomNumber(questions.length);
  while (arr.includes(number)) {
    number = randomNumber(questions.length);
  }
  return number;
});

function variationToShape(variation: Variation, chess: Chess): Omit<Arrow, 'opacity'> {
  const move = chess.move(variation.move, { dry_run: true });
  if (move === null) {
    throw new Error('invalid move');
  }
  return {
    orig: move.from as Key,
    dest: move.to as Key,
  };
}

function variationsToShapes(variations: Variations, chess: Chess): Arrow[] {
  const initialOpacity = 1.0;
  const minimumOpacity = 0.3;
  const result = [{
    ...variationToShape(variations.one, chess),
    brush: 'paleGreen',
    opacity: initialOpacity,
  }];
  if (variations.two) {
    result.push({
      ...variationToShape(variations.two, chess),
      brush: 'yellow',
      opacity: Math.max(
        initialOpacity - Math.abs(variations.one.evaluation - variations.two.evaluation) * 0.5,
        minimumOpacity,
      ),
    });
  }
  if (variations.three) {
    result.push({
      ...variationToShape(variations.three, chess),
      brush: 'paleRed',
      opacity: Math.max(
        initialOpacity - Math.abs(variations.one.evaluation - variations.three.evaluation) * 0.5,
        minimumOpacity,
      ),
    });
  }
  return result;
}

export default (): React.ReactElement => {
  const [questionNumber, setQuestionNumber] = useState(0);
  const [boardAndBar, setBoardAndBar] = useState({
    sliderValue: 0,
    initialFEN: questions[questionKeys[0]].fen,
    playMove: null,
  } as BoardAndBarState);
  const [player, setPlayer] = useState('');
  const [answers, setAnswers] = useState([] as Answer[]);
  const [currentState, setCurrentState] = useState(State.evaluation);

  let questionText = null;
  let shapes = [] as Arrow[];
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

      const currentQuestion = questions[questionKeys[questionNumber]];

      shapes = variationsToShapes(currentQuestion.variations, new Chess(currentQuestion.fen));
      questionText = (
        <>
          <LastResult
            question={currentQuestion}
            answer={lastAnswer}
          />
          <Button
            onClick={() => {
              if (questionNumber === 4) {
                setCurrentState(State.summary);
              } else {
                setQuestionNumber((n) => n + 1);
                setCurrentState(State.evaluation);
                setBoardAndBar({
                  initialFEN: questions[questionKeys[questionNumber + 1]].fen,
                  playMove: null,
                  sliderValue: 0,
                });
              }
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
    case State.summary: {
      break;
    }
    default:
      throw new Error('unreachable');
  }

  return (
    <Container fluid textAlign="center">
      <Header as="h1" style={{ marginBottom: '-14px' }}><i>Guess the Eval</i></Header>
      {
        currentState === State.summary
          ? null
          : (
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
          )
      }
      <Container textAlign="center">
        {
          currentState === State.summary
            ? (
              <>
                <Header as="h2">
                  You earned&nbsp;
                  {totalPoints(questions, answers).toFixed(1)}
                  &nbsp;points!
                </Header>
                <Header as="h2">
                  <a href=".">Play again?</a>
                </Header>
              </>
            )
            : (
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
                shapes={shapes}
              />
            )
        }
        {questionText}
        <Divider hidden />
        <Divider hidden />
        <Divider hidden />
        <p>
          <a href="https://github.com/MakotoE/guess-the-eval/blob/main/about.md" target="_blank" rel="noopener noreferrer">
            About Guess the Eval and GitHub repo
          </a>
        </p>
        <Divider hidden />
      </Container>
    </Container>
  );
};
