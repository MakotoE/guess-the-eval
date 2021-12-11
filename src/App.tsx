import React, {useEffect} from 'react';
import Chessground from './chessground';
import {Config} from 'chessground/config';
import {calculateEval, useAppDispatch, useAppSelector} from "./store";

export function App(): React.ReactElement {
	const dispatch = useAppDispatch();
	const evaluation = useAppSelector(state => state.stockfish.evaluation);

	const fen = '3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27';
	const boardConfig: Config = {fen};

	useEffect(() => {
		dispatch(calculateEval(fen));
	}, []);

	return <div>
		<Chessground config={boardConfig} width={500} height={500} />
		<p>{evaluation == null ? 'Stockfish is thinking...' : evaluation}</p>
	</div>;
}
