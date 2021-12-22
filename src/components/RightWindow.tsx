import React, {useEffect, useState} from 'react';
import {Button, Form, InputOnChangeData, Popup} from 'semantic-ui-react';
import {Answer, PointsSolver} from '../calculatePoints';
import {calculateEval, nextQuestion, submitAnswer, useAppDispatch, useAppSelector} from '../store';
import {LastResult} from './LastResult';
import {Chess} from 'chess.ts';
import {questions} from '../questions';

export function RightWindow(): React.ReactElement {
	const dispatch = useAppDispatch();
	const {currentQuestion, points, evaluation, currentDepth, lastResult} = useAppSelector(state => state.game);
	const [answers, setAnswers] = useState<{[key in keyof Answer]: string}>({
		evaluation: '',
		bestMove: '',
		playerOrTournament: '',
	});

	const showingAnswer = lastResult !== null;

	const fen = questions[currentQuestion].fen;

	useEffect(() => {
		dispatch(calculateEval(fen));
	}, [dispatch, fen]);

	const handleChange = (_: React.ChangeEvent, {name, value}: InputOnChangeData) => {
		setAnswers({...answers, [name]: value});
	};

	let turnStr = 'white';
	if (new Chess(fen).turn() === 'b') {
		turnStr = 'black';
	}

	return <>
		<p>Total points: {points}</p>
		<Form onSubmit={() => {
			if (showingAnswer) {
				dispatch(nextQuestion());
			} else {
				dispatch(submitAnswer(inputStringsToAnswer(answers)));
			}
		}}>
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
				name='playerOrTournament'
				value={answers.playerOrTournament}
				onChange={handleChange}
				label='Name one of the players or the tournament'
				autoComplete='off'
				spellCheck={false}
			/>
			<p>
				{evaluation === null ? 'Stockfish is thinking...' : 'Stockfish is done thinking'} (Depth: {currentDepth})
			</p>
			{showingAnswer ? <LastResult points={new PointsSolver(lastResult)} /> : null}
			<Popup
				trigger={
					<div>
						{/* <div> needed for tooltip to properly work*/}
						<Button disabled={evaluation === null}>
							{showingAnswer ? 'Okay, next' : 'Submit my guess'}
						</Button>
					</div>
				}
				content={'Stockfish is still thinking'}
				disabled={evaluation !== null}
				size='tiny'
			/>
		</Form>
	</>;
}

function inputStringsToAnswer(inputs: {[key in keyof Answer]: string}): Answer {
	let evaluation = parseFloat(inputs.evaluation);
	if (isNaN(evaluation)) {
		evaluation = 0;
	}
	return {...inputs, evaluation};
}
