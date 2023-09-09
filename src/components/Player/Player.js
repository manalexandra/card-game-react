import React from 'react';

function Player({ name, cards, playCard }) {
    return (
        <div className="player">
            <h2>{name}</h2>
            <ul>
            {cards.map((card, index) => (
                <li key={index} onClick={() => playCard(index)}>
                {`${card.value} of ${card.suit}`}
                </li>
            ))}
            </ul>
        </div>
        );
}

export default Player;
