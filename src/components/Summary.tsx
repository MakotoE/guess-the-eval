import React from 'react';
import { TextArea } from 'semantic-ui-react';
import { PointsSolver, QuestionResult } from '../PointsSolver';

function resultsString(index: number, result: QuestionResult): string {
  const { stockfishEval, answer } = result;
  const points = new PointsSolver(result);
  return `> Question ${index}:
>\tMy eval guess was off by ${Math.abs(answer.evaluation - stockfishEval[0].evaluation).toFixed(2)}.${points.foundBestMove() ? '\n>\tI found one of the top 3 moves.' : ''}${points.foundPlayerOrTournament() ? '\n>\tI guessed one of the players or the tournament.' : ''}
>\tI earned ${points.totalPoints().toFixed(1)} points on this question.
>
`;
}

interface Props {
  points: number,
  results: QuestionResult[],
}

export default function Summary({ points, results }: Props): React.ReactElement {
  return (
    <>
      <p>Here&apos;s a summary of the results. Copy and paste this to share your results.</p>
      <TextArea
        value={
          `> I scored ${points.toFixed(1)} points.\n>\n${results.map((result, index) => (
            resultsString(index, result)
          )).join()}`
        }
        rows={35}
        style={{ width: '100%' }}
      />
    </>
  );
}
