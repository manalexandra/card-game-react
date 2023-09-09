import { useEffect, useState } from "react";
import Player from "../Player/Player";
import GameOver from "../Game/GameOver";

const Game = () => {
  const [deckId, setDeckId] = useState(null);
  const [player1Hand, setPlayer1Hand] = useState([]);
  const [player2Hand, setPlayer2Hand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("Player 1");
  const [message, setMessage] = useState("");
  const [cardsToDraw, setCardsToDraw] = useState(0);
  const [drawRequired, setDrawRequired] = useState(false);
  const [missTurnsPlayer1, setMissTurnsPlayer1] = useState(0);
  const [missTurnsPlayer2, setMissTurnsPlayer2] = useState(0);
  const [player1Blocked, setPlayer1Blocked] = useState(false);
  const [player2Blocked, setPlayer2Blocked] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const response = await fetch(
          `https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch deck");
        }
        const data = await response.json();
        setDeckId(data.deck_id);
      } catch (error) {
        console.error("Error fetching deck:", error);
      }
    };

    fetchDeck();
  }, []);

  const dealInitialCards = async () => {
    if (deckId) {
      const numCards = 5;

      const player1Cards = await dealCards(deckId, numCards);
      setPlayer1Hand(player1Cards);

      const player2Cards = await dealCards(deckId, numCards);
      setPlayer2Hand(player2Cards);

      const discardCard = await dealCards(deckId, 1);
      setDiscardPile([discardCard[0]]);
    }
  };

  const dealCards = async (deckId, numCards) => {
    try {
      const response = await fetch(
        `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${numCards}`
      );
      if (!response.ok) {
        throw new Error("Failed to deal cards");
      }
      const data = await response.json();
      return data.cards;
    } catch (error) {
      console.error("Error dealing cards:", error);
    }
  };

  const playCard = (cardIndex) => {
    const currentPlayerHand =
      currentPlayer === "Player 1" ? player1Hand : player2Hand;
    const playedCard = currentPlayerHand[cardIndex];
    if (player1Blocked && currentPlayer === "Player 1") {
      setMessage("Player 1 is blocked.");
      return;
    } else if (player2Blocked && currentPlayer === "Player 2") {
      setMessage("Player 2 is blocked.");
      return;
    }
    if (playedCard.value === "2" || playedCard.value === "3") {
      playTwoOrThree(playedCard, currentPlayerHand, cardIndex);
    } else if (drawRequired) {
      setMessage("You must draw the required cards before playing.");
    } else if (playedCard.value === "4" || playedCard.value === "ACE") {
      console.log("4 or ace played");
    } else {
      playNoRuledCard(playedCard, currentPlayerHand, cardIndex);
    }

    if (currentPlayerHand.length === 0) {
      setGameEnded(true);
      setWinner(currentPlayer);
    }
  };

  const playTwoOrThree = (playedCard, currentPlayerHand, cardIndex) => {
    const numCardsToDraw = parseInt(playedCard.value) + cardsToDraw;
    const updatedDiscardPile = [...discardPile, playedCard];
    setDiscardPile(updatedDiscardPile);
    currentPlayerHand.splice(cardIndex, 1);

    if (playedCard.value === "2") {
      setCardsToDraw(numCardsToDraw);
      setCurrentPlayer(currentPlayer === "Player 1" ? "Player 2" : "Player 1");
      setMessage("");
      setDrawRequired(true);
    } else if (playedCard.value === "3") {
      setCardsToDraw(numCardsToDraw);
      setCurrentPlayer(currentPlayer === "Player 1" ? "Player 2" : "Player 1");
      setMessage("");
      setDrawRequired(true);
    }
  };

  const playNoRuledCard = (playedCard, currentPlayerHand, cardIndex) => {
    const topDiscardCard = discardPile[discardPile.length - 1];

    if (
      playedCard.value === topDiscardCard.value ||
      playedCard.suit === topDiscardCard.suit
    ) {
      currentPlayerHand.splice(cardIndex, 1);
      const updatedDiscardPile = [...discardPile, playedCard];
      setDiscardPile(updatedDiscardPile);
      setCurrentPlayer(currentPlayer === "Player 1" ? "Player 2" : "Player 1");
      setMessage("");
      setDrawRequired(false);
    } else {
      setMessage("Invalid move. Play a card with the same suit or value.");
    }
  };

  const drawCard = async () => {
    if (deckId) {
      const currentPlayerHand =
        currentPlayer === "Player 1" ? player1Hand : player2Hand;

      if (cardsToDraw > 0) {
        const drawnCards = await dealCards(deckId, cardsToDraw);
        currentPlayerHand.push(...drawnCards);
        setCardsToDraw(0);
        setCurrentPlayer(
          currentPlayer === "Player 1" ? "Player 2" : "Player 1"
        );
        setMessage("");
        setDrawRequired(false);
      } else {
        if (currentPlayer === "Player 1" && missTurnsPlayer2 > 0) {
          setMissTurnsPlayer2(0);
          setPlayer2Blocked(false);
          const drawnCard = await dealCards(deckId, 1);
          currentPlayerHand.push(drawnCard[0]);
          setCurrentPlayer("Player 2");
          setMessage("");
        } else if (currentPlayer === "Player 2" && missTurnsPlayer1 > 0) {
          setMissTurnsPlayer1(0);
          setPlayer2Blocked(false);
          const drawnCard = await dealCards(deckId, 1);
          currentPlayerHand.push(drawnCard[0]);
          setCurrentPlayer("Player 1");
          setMessage("");
        } else {
          const drawnCard = await dealCards(deckId, 1);
          currentPlayerHand.push(drawnCard[0]);
          setCurrentPlayer(
            currentPlayer === "Player 1" ? "Player 2" : "Player 1"
          );
          setMessage("");
        }
      }
      setCurrentPlayer(currentPlayer === "Player 1" ? "Player 2" : "Player 1");
      setMessage("");
    }
  };

  if (gameEnded) {
    return <GameOver winner={winner} />;
  }

  return (
    <div>
      <button onClick={dealInitialCards}>Deal Cards</button>
      <div className="players-container">
        <Player name="Player 1" cards={player1Hand} playCard={playCard} />
        <Player name="Player 2" cards={player2Hand} playCard={playCard} />
      </div>
      <div className="discard-pile">
        <h3>Discard Pile</h3>
        <ul>
          {discardPile.map((card, index) => (
            <li key={index}>{`${card.value} of ${card.suit}`}</li>
          ))}
        </ul>
      </div>
      <div className="message">{message}</div>
      <button onClick={drawCard}>Draw Card</button>
    </div>
  );
};

export default Game;
