import React, {useState} from 'react';
import {Button, Form, InputOnChangeData, Popup} from 'semantic-ui-react';
import {Turn} from '../stockfish';
import {Answer} from '../calculatePoints';

interface Props {
	evaluationFinished: boolean;
	depth: number;
	nextTurn: Turn;
	onSubmit: (answers: Answer) => void;
}

export function Inputs({evaluationFinished, depth, nextTurn, onSubmit}: Props): React.ReactElement {
	const [answers, setAnswers] = useState<{[key in keyof Answer]: string}>({
		evaluation: '',
		bestMove: '',
		playerOrTournament: '',
	});

	const handleChange = (_: React.ChangeEvent, {name, value}: InputOnChangeData) => {
		setAnswers({...answers, [name]: value});
	};

	let turnStr = 'white';
	if (nextTurn === Turn.Black) {
		turnStr = 'black';
	}

	return <Form onSubmit={() => onSubmit({...answers, evaluation: parseInt(answers.evaluation)})}>
		<Form.Input
			name='evaluation'
			value={answers.evaluation}
			onChange={handleChange}
			label='Guess the eval'
			placeholder='i.e. +1.0'
			type='number'
			autoComplete='off'
		/>
		<Form.Input
			name='bestMove'
			value={answers.bestMove}
			onChange={handleChange}
			label={`What is the best move for ${turnStr}?`}
			placeholder='i.e. Ke2'
			autoComplete='off'
			spellCheck={false}
		/>
		<Form.Input
			name='playerTournament'
			value={answers.playerOrTournament}
			onChange={handleChange}
			label='Name one of the players or the tournament'
			autoComplete='off'
			spellCheck={false}
		/>
		<p>{evaluationFinished ? 'Stockfish is done thinking' : 'Stockfish is thinking...'} (Depth: {depth})</p>
		<Popup
			trigger={<div><Button disabled={!evaluationFinished}>Submit answers</Button></div>}
			content={'Stockfish is still thinking'}
			disabled={evaluationFinished}
			size='tiny'
		/>
	</Form>;
}
