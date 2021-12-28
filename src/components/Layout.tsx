import { Config } from 'chessground/config';
import { Grid } from 'semantic-ui-react';
import React from 'react';
import { Chess } from 'chess.ts';
import { Color } from 'chessground/types';
import Chessground from './chessground';

interface Props {
  fen: string;
}

export default ({ fen, children }: React.PropsWithChildren<Props>): React.ReactElement => {
  let orientation: Color = 'white';
  if (new Chess(fen).turn() === 'b') {
    orientation = 'black';
  }

  const boardConfig: Config = {
    fen,
    orientation,
    draggable: {
      enabled: false,
    },
  };

  return (
    <Grid centered style={{ marginTop: '20px' }}>
      <Grid.Row>
        <Grid.Column width={2} style={{ minWidth: '440px' }}>
          <Chessground config={boardConfig} width={400} height={400} />
        </Grid.Column>
        <Grid.Column width={1} style={{ minWidth: '400px' }}>
          {children}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};
