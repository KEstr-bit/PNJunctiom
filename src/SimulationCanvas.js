import React from 'react';

export const SimulationCanvas = ({ particles }) => {
  return (
    <div
      style={{
        position: 'relative',
        margin: '20px auto 0',
        height: '480px',
        width: '800px',
        border: '1px solid #ccc',
        overflow: 'hidden',
      }}
    >
      {particles.map((particle, index) => 

          particle.render()

        )}
    </div>
  );
};