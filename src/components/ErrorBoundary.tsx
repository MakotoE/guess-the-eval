import React, {ReactNode} from 'react';

interface Props {
	children?: ReactNode | undefined;
}

export class ErrorBoundary extends React.Component<Props, {error: string}> {
	constructor(props: Props) {
		super(props);
		this.state = {error: ''};
	}

	static getDerivedStateFromError(error: Error) {
		return {error: error.toString()}
	}

	render() {
		if (this.state.error.length > 0) {
			return <pre>{this.state.error}</pre>
		}

		return this.props.children;
	}
}
