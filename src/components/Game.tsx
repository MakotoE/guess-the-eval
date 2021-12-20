import React from 'react';
import {useAppSelector} from '../store';
import {RightWindow} from './RightWindow';
import {Layout} from './Layout';
import {questions} from '../questions';
import {Chess} from 'chess.ts';

export function Game(): React.ReactElement {
	const currentQuestion = useAppSelector(state => state.game.currentQuestion);

	let fen = '';
	let rightSide: React.ReactElement;
	if (currentQuestion < questions.length) {
		fen = questions[currentQuestion].fen;
		rightSide = <RightWindow />;
	} else {
		fen = new Chess().fen();
		rightSide = <p>End of game</p>;
	}

	return <Layout fen={fen}>
		{rightSide}
	</Layout>;
}
