import React, { useState } from 'react';
import { Button, Container } from 'semantic-ui-react';
import { Chess } from 'chess.ts';
import { Answer, PointsSolver } from '../PointsSolver';
import {
  numberOfVariations, Question, Move, Moves,
} from '../questions';

function formatEval(evaluation: number): string {
  const sign = evaluation > 0 ? '+' : '';
  return sign + evaluation.toFixed(2);
}

interface Props {
  question: Question;
  answer: Answer;
}

function variationString(variation: Move): string {
  return `${variation.move} (${formatEval(variation.evaluation)})`;
}

function variationsString(variations: Moves): string {
  let result = variationString(variations.one);
  if (variations.two !== null) {
    result += `, ${variationString(variations.two)}`;
  }

  if (variations.three !== null) {
    result += `, ${variationString(variations.three)}`;
  }

  return result;
}

interface ImportResponse {
  url: string,
}

export default ({ question, answer }: Props): React.ReactElement => {
  const [lichessLoading, setLichessLoading] = useState(false);

  const onPGNUpload = async () => {
    setLichessLoading(true);
    const response = await fetch(
      'https://lichess.org/api/import',
      {
        method: 'POST',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        body: new URLSearchParams({ pgn: question.pgn }),
      },
    );
    const body = await response.json() as ImportResponse;

    const turn = new Chess(question.fen).turn();
    window.open(`${body.url}${turn === 'b' ? '/black' : ''}#${question.turn_number}`, '_blank')?.focus();
    setLichessLoading(false);
  };

  const points = new PointsSolver({ question, answer });
  return (
    <Container>
      {
        points.foundWinningSide()
          ? 'You guessed the winning side. +20 points'
          : 'You did not guess the winning side.'
      }
      <br />
      {`Your eval guess was off by ${Math.abs(answer.evaluation - question.moves.one.evaluation).toFixed(2)}. Actual eval was ${formatEval(question.moves.one.evaluation)}.`}
      <br />
      {`${points.evalPoints().toFixed(1)} points for the evaluation.`}
      <br />
      {
        points.foundBestMove()
          ? `You found one of the top 3 moves. Multiplier of x${points.bestMoveMultiplier().toFixed(1)}`
          : 'You did not find a best move.'
      }
      <br />
      {`These are the top ${numberOfVariations(question.moves)} moves according to Stockfish: ${variationsString(question.moves)}.`}
      <br />
      <Button
        onClick={onPGNUpload}
        loading={lichessLoading}
        size="mini"
        inverted
      >
        See game on Lichess
      </Button>
      <br />
      <br />
      <strong>{`You earned ${points.totalPoints().toFixed(1)} points.`}</strong>
    </Container>
  );
};
