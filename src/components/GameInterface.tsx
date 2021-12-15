import React, {useEffect} from "react";
import Chessground from "../chessground";
import {calculateEval, useAppDispatch, useAppSelector} from "../store";
import {Config} from "chessground/config";
import {Container, Grid} from "semantic-ui-react";
import {Inputs} from "./Inputs";

export function GameInterface(): React.ReactElement {
	const dispatch = useAppDispatch();
	const evaluation = useAppSelector(state => state.stockfish.evaluation);
	const depth = useAppSelector(state => state.stockfish.currentDepth);

	const fen = '3rb1k1/1Bp2pp1/4p3/2P1P2p/r5nP/1N4P1/P4P2/R3R1K1 b - - 0 27';
	const boardConfig: Config = {fen};

	useEffect(() => {
		dispatch(calculateEval(fen));
	}, []);

	return <Grid centered>
		<Grid.Row>
			<Grid.Column width={2} style={{minWidth: '400px'}}>
				<Chessground config={boardConfig} width={400} height={400} />
			</Grid.Column>
			<Grid.Column width={1} style={{minWidth: '400px'}}>
				<Inputs />
			</Grid.Column>
		</Grid.Row>
	</Grid>;
}
