import { useEffect, useState } from "react";
import GameOver from "../Game/GameOver";
import styles from "./Game.module.css";

const Game = ({ player1Name, player2Name }) => {
  const [deckId, setDeckId] = useState(null);
  const [deckSize, setDeckSize] = useState(52);
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
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [cardsDealt, setCardsDealt] = useState(false);
  const [nrOfFourtPlayed, setNrOfFourtPlayed] = useState(1);
  const [nrOfAcePlayed, setNrOfAcePlayed] = useState(1);

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
      setDeckSize((prevDeckSize) => prevDeckSize - numCards);
      setPlayer1Hand(player1Cards);

      const player2Cards = await dealCards(deckId, numCards);
      setDeckSize((prevDeckSize) => prevDeckSize - numCards);
      setPlayer2Hand(player2Cards);

      const discardCard = await dealCards(deckId, 1);
      setDeckSize((prevDeckSize) => prevDeckSize - 1);
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

  const playCard = (cardIndex, name) => {
    if (currentPlayer !== name) {
      setMessage("It's not your turn.");
      return;
    }
    if (currentPlayer === "Player 1" && missTurnsPlayer1 > 0) {
      setMessage("You are blocked.");
      setCurrentPlayer("Player 2");
      return;
    } else if (currentPlayer === "Player 2" && missTurnsPlayer2 > 0) {
      setMessage("You are blocked.");
      setCurrentPlayer("Player 1");
      return;
    }
    if (missTurnsPlayer1 > 0 || missTurnsPlayer2 > 0) {
      if (missTurnsPlayer1 > 0) {
        setMissTurnsPlayer1((prevValue) => prevValue - 1);
        setCurrentPlayer("Player 2");
      }
      if (missTurnsPlayer2 > 0) {
        setMissTurnsPlayer2((prevValue) => prevValue - 1);
        setCurrentPlayer("Player 1");
      }
    }
    const currentPlayerHand =
      currentPlayer === "Player 1" ? player1Hand : player2Hand;
    const playedCard = currentPlayerHand[cardIndex];
    const lastItemIndex = discardPile.length - 1;
    if (
      playedCard.suit === discardPile[lastItemIndex].suit ||
      playedCard.value === discardPile[lastItemIndex].value
    ) {
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
        playFourOrAce(playedCard, currentPlayerHand, cardIndex);
      } else {
        playNoRuledCard(playedCard, currentPlayerHand, cardIndex);
      }
    } else {
      if (drawRequired) {
        setMessage("You must draw the required cards before playing.");
      } else {
        setMessage("Invalid move. Play a card with the same suit or value.");
      }
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
    if (missTurnsPlayer1 === 0 && missTurnsPlayer2 === 0) {
      setMissTurnsPlayer1(0);
      setMissTurnsPlayer2(0);
    }

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

  const playFourOrAce = (playedCard, currentPlayerHand, cardIndex) => {
    const nextPlayer = currentPlayer === "Player 1" ? "Player 2" : "Player 1";
    const currentPlayerHasFour = currentPlayerHand.some(
      (card) => card.value === "4"
    );
    const currentPlayerHasAce = currentPlayerHand.some(
      (card) => card.value === "ACE"
    );
    const nextPlayerHand =
      nextPlayer === "Player 1" ? player1Hand : player2Hand;
    const nextPlayerHasFour = nextPlayerHand.some((card) => card.value === "4");
    const nextPlayerHasAce = nextPlayerHand.some(
      (card) => card.value === "ACE"
    );
    const updatedDiscardPile = [...discardPile, playedCard];
    setDiscardPile(updatedDiscardPile);
    currentPlayerHand.splice(cardIndex, 1);
    if (
      playedCard.value === "4" &&
      currentPlayerHasFour &&
      !nextPlayerHasFour
    ) {
      if (nrOfFourtPlayed === 1) {
        if (currentPlayer === "Player 1") {
          setMissTurnsPlayer2(1);
        } else {
          setMissTurnsPlayer1(1);
        }
      } else {
        if (currentPlayer === "Player 1") {
          setMissTurnsPlayer2(nrOfFourtPlayed);
        } else {
          setMissTurnsPlayer1(nrOfFourtPlayed);
        }
      }
      setCurrentPlayer(currentPlayer);
      return;
    } else if (
      playedCard.value === "4" &&
      currentPlayerHasFour &&
      nextPlayerHasFour
    ) {
      setNrOfFourtPlayed((prevValue) => prevValue + 1);
      setMessage(`The next player (${nextPlayer}) can play a '4' now.`);
    } else if (
      playedCard.value === "ACE" &&
      currentPlayerHasAce &&
      !nextPlayerHasAce
    ) {
      if (nrOfAcePlayed === 1) {
        if (currentPlayer === "Player 1") {
          setMissTurnsPlayer2(1);
        } else {
          setMissTurnsPlayer1(1);
        }
      } else if (nrOfAcePlayed > 1) {
        if (currentPlayer === "Player 1") {
          setMissTurnsPlayer2(nrOfAcePlayed);
        } else {
          setMissTurnsPlayer1(nrOfAcePlayed);
        }
      }
      setCurrentPlayer(currentPlayer);
      return;
    } else if (
      playedCard.value === "ACE" &&
      currentPlayerHasAce &&
      nextPlayerHasAce
    ) {
      setNrOfAcePlayed((prevValue) => prevValue + 1);
      setMessage("The next player can play an ACE now.");
    }

    setCurrentPlayer(nextPlayer);
    setDrawRequired(false);
  };

  const playNoRuledCard = (playedCard, currentPlayerHand, cardIndex) => {
    if (missTurnsPlayer1 === 1 || missTurnsPlayer2 === 1) {
      setMissTurnsPlayer1(0);
      setMissTurnsPlayer2(0);
      if (currentPlayer === "Player 1") {
        setCurrentPlayer("Player 2");
      } else {
        setCurrentPlayer("Player 1");
      }
    }
    currentPlayerHand.splice(cardIndex, 1);
    const updatedDiscardPile = [...discardPile, playedCard];
    setDiscardPile(updatedDiscardPile);
    if (missTurnsPlayer1 === 0 && missTurnsPlayer2 === 0) {
      setCurrentPlayer(currentPlayer === "Player 1" ? "Player 2" : "Player 1");
    }
    setMessage("");
    setDrawRequired(false);
  };

  const drawCard = async () => {
    if (deckId) {
      const currentPlayerHand =
        currentPlayer === "Player 1" ? player1Hand : player2Hand;

      if (cardsToDraw > 0) {
        setDeckSize((prevDeckSize) => prevDeckSize - cardsToDraw);
        const drawnCards = await dealCards(deckId, cardsToDraw);
        currentPlayerHand.push(...drawnCards);
        setCardsToDraw(0);
        setCurrentPlayer(
          currentPlayer === "Player 1" ? "Player 2" : "Player 1"
        );
        setMessage("");
        setDrawRequired(false);
      } else {
        setDeckSize((prevDeckSize) => prevDeckSize - 1);
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
      <div className={styles["game-container"]}>
        <div className={styles.player1}>
          <h3>{player1Name}</h3>
          <div className="player-cards">
            {player1Hand.map((card, index) => (
              <img
                className={styles["player-cards"]}
                key={index}
                src={card.image}
                alt={`${card.value} of ${card.suit}`}
                onClick={() => playCard(index, "Player 1")}
              />
            ))}
          </div>
        </div>
        <div className={styles.center}>
          <div className={styles["discard-pile"]}>
            <h3>Discard Pile</h3>
            <div className="discard-cards">
              {discardPile.map((card, index) => (
                <img
                  className={styles.img}
                  key={index}
                  src={card.image}
                  alt={`${card.value} of ${card.suit}`}
                />
              ))}
            </div>
          </div>
          <div className={styles.buttons}>
            <button
              onClick={() => {
                dealInitialCards();
                setCardsDealt(true);
                setGameStarted(true);
              }}
              disabled={cardsDealt}
              className={cardsDealt ? styles["disabled-button"] : ""}
            >
              Deal Cards
            </button>
            <button
              onClick={drawCard}
              disabled={!gameStarted}
              className={!gameStarted ? styles["disabled-button"] : ""}
            >
              Draw Card
            </button>
          </div>
          <div className={styles.message}>{message}</div>
        </div>
        <div className={styles.player2}>
          <h3>{player2Name}</h3>
          <div className="player-cards">
            {player2Hand.map((card, index) => (
              <img
                className={styles["player-cards"]}
                key={index}
                src={card.image}
                alt={`${card.value} of ${card.suit}`}
                onClick={() => playCard(index, "Player 2")}
              />
            ))}
          </div>
        </div>
      </div>
      {gameEnded && <GameOver winner={winner} />};
    </div>
  );
};

export default Game;
