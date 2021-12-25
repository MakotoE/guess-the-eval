import React, { useEffect } from 'react';
import { Chess } from 'chess.ts';
import { useAppSelector } from '../store';
import RightSide from './RightSide';
import Layout from './Layout';
import { questions } from '../questions';
import Summary from './Summary';

function checkCompatibility() {
  if (!crossOriginIsolated) {
    throw new Error(
      'SharedArrayBuffer is disabled. See'
      + ' https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#browser_compatibility'
      + ' for supported browsers.',
    );
  }
}

export default (): React.ReactElement => {
  const { currentQuestion, points, results } = useAppSelector((state) => state.game);
  const error = useAppSelector((state) => state.game.error);

  useEffect(checkCompatibility, []);

  let fen = '';
  let rightSide: React.ReactElement;
  if (currentQuestion < questions.length) {
    fen = questions[currentQuestion].fen;
    rightSide = <RightSide />;
  } else {
    fen = new Chess().fen();
    rightSide = <Summary points={100} results={results} />;
  }

  return (
    <Layout fen={fen}>
      <p>
        Total points:&nbsp;
        {points.toFixed(1)}
      </p>
      {rightSide}
      {error ? <pre>{error}</pre> : null}
    </Layout>
  );
};
