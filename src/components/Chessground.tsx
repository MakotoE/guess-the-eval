import React, { useEffect, useRef, useState } from 'react';
import { Chessground as ChessgroundApi } from 'chessground';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';

interface Props {
  config: Config;
  style: React.CSSProperties,
}

export default ({ config, style }: Props): React.ReactElement => {
  const [api, setApi] = useState(null as Api | null);

  const ref = useRef(null as HTMLDivElement | null);

  useEffect(() => {
    if (ref && ref.current) {
      if (api) {
        api.set(config);
      } else {
        setApi(ChessgroundApi(ref.current, config));
      }
    }
  }, [api, ref, config]);

  return <div ref={ref} style={style} />;
};
