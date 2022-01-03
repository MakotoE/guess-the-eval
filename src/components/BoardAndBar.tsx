import { Config } from 'chessground/config';
import React from 'react';
import Chessground from './chessground';
import EvalBar from './EvalBar';

interface Props {
  config: Config,
}

export default ({ config }: Props): React.ReactElement => (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <Chessground
      config={config}
      width={Math.min(500, document.documentElement.clientWidth)}
      height={Math.min(500, document.documentElement.clientWidth)}
    />
    <EvalBar />
  </div>
);
