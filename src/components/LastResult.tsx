import React from 'react';
import { Container } from 'semantic-ui-react';
import { PointsSolver } from '../PointsSolver';

function formatEval(evaluation: number): string {
  const sign = evaluation > 0 ? '+' : '';
  return sign + evaluation.toFixed(2);
}

interface Props {
  points: PointsSolver;
}

export default ({ points }: Props): React.ReactElement => {
  const { question, answer } = points.result;
  return (
    <Container>
      {
        points.foundWinningSide()
          ? 'You guessed the winning side. +20 points'
          : 'You did not guess the winning side. +0 points'
      }
      <br />
      {`Your eval guess was off by ${Math.abs(answer.evaluation - question.bestMoves[0].evaluation).toFixed(2)}. Actual eval was ${formatEval(question.bestMoves[0].evaluation)}.`}
      <br />
      {`${points.evalPoints().toFixed(1)} points for the evaluation.`}
      <br />
      {
        points.foundBestMove()
          ? `You found one of the top 3 moves. Multiplier of x${points.bestMoveMultiplier().toFixed(1)}`
          : 'You did not find a best move.'
      }
      {
        // Multiplier was applied to a negative score
        points.evalPoints() < 0 && points.bestMoveMultiplier() > 1
          ? ' (OOOF!)'
          : ''
      }
      <br />
      {`These are the top ${question.bestMoves.length} moves according to Stockfish: ${question.bestMoves.map((variation) => `, ${variation.move}`).join('').slice(2, -1)}.`}
      <br />
      {
        points.foundPlayer()
          ? 'You guessed one of the players correctly. +10 points'
          : 'You did not guess a player correctly.'
      }
      <br />
      {`This was a game between ${question.players.white} (white) and ${question.players.black} (black).`}
      <br />
      <a href={question.url} target="_blank" rel="noopener noreferrer">Source</a>
      <br />
      {`You earned ${points.totalPoints().toFixed(1)} points.`}
    </Container>
  );
};
