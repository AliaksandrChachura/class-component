import React from 'react';

interface Props {
  name: string;
  description: string;
}

const Card: React.FC<Props> = ({ name, description }) => {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>{description}</p>
    </div>
  );
};

export default Card;
