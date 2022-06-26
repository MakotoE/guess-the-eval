import React from 'react';
import { Container } from 'semantic-ui-react';
import { Answer, PointsSolver } from '../PointsSolver';
import {
  numberOfVariations, Question, Variation, Variations,
} from '../questions';

function formatEval(evaluation: number): string {
  const sign = evaluation > 0 ? '+' : '';
  return sign + evaluation.toFixed(2);
}

interface Props {
  question: Question;
  answer: Answer;
}

function variationString(variation: Variation): string {
  return `${variation.move} (${formatEval(variation.evaluation)})`;
}

function variationsString(variations: Variations): string {
  let result = variationString(variations.one);
  if (variations.two !== null) {
    result += `, ${variationString(variations.two)}`;
  }

  if (variations.three !== null) {
    result += `, ${variationString(variations.three)}`;
  }

  return result;
}

export default ({ question, answer }: Props): React.ReactElement => {
  const points = new PointsSolver({ question, answer });
  return (
    <Container>
      {
        points.foundWinningSide()
          ? 'You guessed the winning side. +20 points'
          : 'You did not guess the winning side.'
      }
      <br />
      {`Your eval guess was off by ${Math.abs(answer.evaluation - question.variations.one.evaluation).toFixed(2)}. Actual eval was ${formatEval(question.variations.one.evaluation)}.`}
      <br />
      {`${points.evalPoints().toFixed(1)} points for the evaluation.`}
      <br />
      {
        points.foundBestMove()
          ? `You found one of the top 3 moves. Multiplier of x${points.bestMoveMultiplier().toFixed(1)}`
          : 'You did not find a best move.'
      }
      <br />
      {`These are the top ${numberOfVariations(question.variations)} moves according to Stockfish: ${variationsString(question.variations)}.`}
      <br />
      <a href={`https://lichess.org/analysis/standard/${question.fen}`} target="_blank" rel="noopener noreferrer">
        See position on Lichess
      </a>
      <br />
      <br />
      <strong>{`You earned ${points.totalPoints().toFixed(1)} points.`}</strong>
    </Container>
  );
};
