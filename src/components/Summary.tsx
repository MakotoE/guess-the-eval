import React from 'react';
import { TextArea } from 'semantic-ui-react';
import { Answer, PointsSolver } from '../PointsSolver';
import { questions } from '../questions';

function resultsString(index: number, answer: Answer): string {
  const question = questions[index];
  const points = new PointsSolver({ question, answer });
  return `> Question ${index}:
>\tMy eval guess was off by ${Math.abs(answer.evaluation - question.bestMoves[0].evaluation).toFixed(2)}.${points.foundBestMove() ? '\n>\tI found one of the top 3 moves.' : ''}${points.foundPlayerOrTournament() ? '\n>\tI guessed one of the players or the tournament.' : ''}
>\tI earned ${points.totalPoints().toFixed(1)} points on this question.
>
`;
}

interface Props {
  points: number,
  results: Answer[],
}

export default ({ points, results }: Props): React.ReactElement => (
  <>
    <p>
      Thanks for playing! Here&apos;s a summary of the results. Copy and paste this to share your
      results.
    </p>
    <TextArea
      value={
        `> I scored ${points.toFixed(1)} points.\n>\n${results.map((result, index) => (
          resultsString(index, result)
        )).join('').slice(0, '\n>\n'.length * -1)}`
      }
      rows={35}
      style={{ width: '100%' }}
    />
  </>
);
