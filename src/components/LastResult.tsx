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
  const { question, stockfishEval, answer } = points.result;
  return (
    <Container>
      {
        points.foundWinningSide()
          ? 'You guessed the winning side. +20 points'
          : 'You did not guess the winning side. +0 points'
      }
      <br />
      {`Your eval guess was off by ${Math.abs(answer.evaluation - stockfishEval[0].evaluation)}. Actual eval was ${formatEval(stockfishEval[0].evaluation)}.`}
      <br />
      {`${points.evalPoints().toFixed(1)} points for the evaluation.`}
      <br />
      {
        points.foundBestMove()
          ? 'You found one of the top 3 moves.'
          : 'You did not find a best move.'
      }
      {
        // Multiplier was applied to a negative score
        points.evalPoints() < 0 && points.bestMoveMultiplier() > 1
          ? ` Your negative eval score was multiplied by ${points.bestMoveMultiplier()}. OOOF!`
          : ''
      }
      <br />
      {`These are the top 3 moves according to Stockfish: ${stockfishEval[0].move}, ${stockfishEval[1].move}, ${stockfishEval[2].move}.`}
      <br />
      {
        points.foundPlayerOrTournament()
          ? 'You guessed one of the players or the tournament. +10 points'
          : 'You did not guess a player or the tournament.'
      }
      <br />
      {`This was a game between ${question.players.white} (white) and ${question.players.black} (black). It was played at the ${question.tournament}.`}
      <br />
      <a href={question.url} target="_blank" rel="noopener noreferrer">Source</a>
      <br />
      {`You earned ${points.totalPoints().toFixed(1)} points.`}
    </Container>
  );
};
