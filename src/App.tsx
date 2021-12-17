import React from 'react';
import {GameInterface} from './components/GameInterface';
import {Container} from 'semantic-ui-react';

export function App(): React.ReactElement {

	return <Container>
		<GameInterface />
	</Container>;
}
