import React, { useEffect, useState } from 'react';

const DataCardList = () => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/datacards')
      .then((res) => res.json())
      .then(setCards)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Available Data Cards</h2>
      {cards.map((card: any) => (
        <div key={card.dataset_id} className="card">
          <h3>{card.title}</h3>
          <p>
            <strong>Creator:</strong> {card.creator}
          </p>
          <p>{card.description}</p>
          <p>
            <strong>License:</strong> {card.license}
          </p>
          <p>
            <strong>Use:</strong> {card.intended_use}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DataCardList;
