import React, { useState } from 'react';
import {
  Button, Form, InputOnChangeData,
} from 'semantic-ui-react';
import { Chess } from 'chess.ts';
import { Answer, PointsSolver } from '../PointsSolver';
import {
  incrementQuestion, addAnswer, useAppDispatch, useAppSelector,
} from '../store';
import LastResult from './LastResult';
import { questions } from '../questions';

function inputStringsToAnswer(inputs: { [key in keyof Answer]: string }): Answer {
  let evaluation = parseFloat(inputs.evaluation);
  if (Number.isNaN(evaluation)) {
    evaluation = 0;
  }
  return { ...inputs, evaluation };
}

const defaultInput: { [key in keyof Answer]: string } = {
  evaluation: '',
  bestMove: '',
  playerOrTournament: '',
};

export default (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { currentQuestion, answers } = useAppSelector((state) => state.game);
  const [input, setInput] = useState(defaultInput);
  const [showAnswer, setShowAnswer] = useState(false);

  const { fen } = questions[currentQuestion];

  const handleChange = (_: React.ChangeEvent, { name, value }: InputOnChangeData) => {
    setInput({ ...input, [name]: value });
  };

  let turnStr = 'white';
  if (new Chess(fen).turn() === 'b') {
    turnStr = 'black';
  }

  return (
    <Form onSubmit={() => {
      if (showAnswer) {
        dispatch(incrementQuestion());
        setInput(defaultInput);
      } else {
        dispatch(addAnswer(inputStringsToAnswer(input)));
      }
      setShowAnswer(!showAnswer);
    }}
    >
      <p>
        {`Question ${currentQuestion + 1}/5—It’s ${turnStr}’s turn to play.`}
      </p>
      <Form.Input
        name="evaluation"
        value={input.evaluation}
        onChange={handleChange}
        disabled={showAnswer}
        label="Guess the eval"
        placeholder="i.e. +1.0"
        type="number"
        autoComplete="off"
        spellCheck={false}
      />
      <Form.Input
        name="bestMove"
        value={input.bestMove}
        onChange={handleChange}
        disabled={showAnswer}
        label={`What is the best move for ${turnStr}?`}
        placeholder="i.e. Ke2"
        autoComplete="off"
        spellCheck={false}
      />
      <Form.Input
        name="playerOrTournament"
        value={input.playerOrTournament}
        onChange={handleChange}
        disabled={showAnswer}
        label="Name one of the players or the tournament"
        autoComplete="off"
        spellCheck={false}
      />
      {
        showAnswer
          ? (
            <LastResult
              points={
                new PointsSolver({
                  question: questions[currentQuestion],
                  answer: answers[answers.length - 1],
                })
              }
            />
          )
          : null
      }
      <Button>
        {showAnswer ? 'Okay, next' : 'Submit my guess'}
      </Button>
    </Form>
  );
};
