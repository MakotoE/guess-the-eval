import React from "react";
import {Button, Form, Popup} from "semantic-ui-react";

interface Props {
	evaluationFinished: boolean;
	depth: number;
}

export function Inputs({evaluationFinished, depth}: Props): React.ReactElement {
	return <Form>
		<Form.Input label='Guess the eval' placeholder='i.e. +1.0' />
		<Form.Input label='What is the best move for black?' placeholder='i.e. Ke2' />
		<Form.Input label='Name one of the players or the tournament' />
		<p>{evaluationFinished ? 'Stockfish is done thinking' : 'Stockfish is thinking...'} (Depth: {depth})</p>
		<Popup
			trigger={<div><Button disabled={!evaluationFinished}>Submit answers</Button></div>}
			content={'Stockfish is still thinking'}
			disabled={evaluationFinished}
			size='tiny'
		/>
	</Form>;
}
