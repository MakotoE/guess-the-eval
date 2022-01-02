import React from 'react';
import { Chess } from 'chess.ts';
import { calculatePointsFromAnswers, useAppSelector } from '../store';
import RightSide from './RightSide';
import Layout from './Layout';
import { questions } from '../questions';
import Summary from './Summary';

export default (): React.ReactElement => {
  const { currentQuestion, answers } = useAppSelector((state) => state.game);
  const error = useAppSelector((state) => state.game.error);

  let fen: string;
  let rightSide: React.ReactElement;
  if (currentQuestion < questions.length) {
    fen = questions[currentQuestion].fen;
    rightSide = <RightSide />;
  } else {
    fen = new Chess().fen();
    rightSide = <Summary results={answers} />;
  }

  return (
    <Layout fen={fen}>
      <p>
        Current points:&nbsp;
        {calculatePointsFromAnswers(answers).toFixed(1)}
      </p>
      {rightSide}
      {error ? <pre>{error}</pre> : null}
    </Layout>
  );
};
