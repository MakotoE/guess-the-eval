import {Config} from 'chessground/config';
import {Grid} from 'semantic-ui-react';
import Chessground from '../chessground'
import React from 'react';

interface Props {
	fen: string;
}

export function Layout({fen, children}: React.PropsWithChildren<Props>): React.ReactElement {
	const boardConfig: Config = {fen};

	return <Grid centered>
		<Grid.Row>
			<Grid.Column width={2} style={{minWidth: '440px'}}>
				<Chessground config={boardConfig} width={400} height={400} />
			</Grid.Column>
			<Grid.Column width={1} style={{minWidth: '400px'}}>
				{children}
			</Grid.Column>
		</Grid.Row>
	</Grid>;
}