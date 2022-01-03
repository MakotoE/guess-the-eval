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
  config: Partial<Config>;
}

export default ({ width, height, config }: Props): React.ReactElement => {
  const [api, setApi] = useState<Api | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref && ref.current && !api) {
      const chessgroundApi = ChessgroundApi(ref.current, {
        animation: { enabled: true, duration: 200 },
        ...config,
      });
      setApi(chessgroundApi);
    } else if (ref && ref.current && api) {
      api.set(config);
    }
  }, [api, ref, config]);

  useEffect(() => {
    api?.set(config);
  }, [api, config]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ height, width }}>
        <div ref={ref} style={{ height: '100%', width: '100%', display: 'table' }} />
      </div>
    </div>
  );
};
