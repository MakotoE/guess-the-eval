import React from 'react';
import Chessground from './chessground';
import {Config} from 'chessground/config';

export function App(): React.ReactElement {
	const boardConfig: Config = {
		fen: '3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27',
	};

	return <div>
		<Chessground config={boardConfig} width={500} height={500} />
	</div>;
}
