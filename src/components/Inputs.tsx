import React from "react";
import {Form} from "semantic-ui-react";

export function Inputs(): React.ReactElement {
	return <Form>
		<Form.Input label='Guess the eval' />
		<Form.Input label='What is the best move for black?' />
		<Form.Input label='Name one of the players or the tournament' />
	</Form>;
}
