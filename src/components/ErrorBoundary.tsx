import React, { ReactNode } from 'react';

interface Props {
  children?: ReactNode | undefined;
}

export default class extends React.Component<Props, { error: string }> {
  constructor(props: Props) {
    super(props);
    this.state = { error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { error: `${error.toString()}\n${error.stack ? error.stack : ''}` };
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;
    if (error.length > 0) {
      return <pre>{error}</pre>;
    }

    return children;
  }
}
