/**
 * Copied from https://github.com/react-chess/chessground.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Chessground as ChessgroundApi } from 'chessground';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';

interface Props {
  width: number;
  height: number;
  config: Config;
}

export default ({ width, height, config }: Props): React.ReactElement => {
  const [api, setApi] = useState<Api | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref && ref.current) {
      if (api) {
        api.set(config);
      } else {
        setApi(ChessgroundApi(ref.current, config));
      }
    }
  }, [api, ref, config]);

  return (
    <div style={{ height, width }}>
      <div ref={ref} style={{ height: '100%', width: '100%', display: 'table' }} />
    </div>
  );
};
