import React from 'react';

interface Props {
  name: string;
  description: string;
}

export default class Card extends React.Component<Props> {
  render() {
    return (
      <div className="card">
        <h3>{this.props.name}</h3>
        <p>{this.props.description}</p>
      </div>
    );
  }
}
