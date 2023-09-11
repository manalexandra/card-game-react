import { useState } from "react";
import GameOver from "../Game/GameOver";
import styles from "./Game.module.css";
import { STRINGS } from "../../constants/Strings";

const Game = ({ player1Name, player2Name }) => {
  const [deckId, setDeckId] = useState(null);
  const [deckSize, setDeckSize] = useState(52);
  const [player1Hand, setPlayer1Hand] = useState([]);
  const [player2Hand, setPlayer2Hand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(player1Name);
  const [message, setMessage] = useState("");
  const [cardsToDraw, setCardsToDraw] = useState(0);
  const [drawRequired, setDrawRequired] = useState(false);
  const [missTurnsPlayer1, setMissTurnsPlayer1] = useState(0);
  const [missTurnsPlayer2, setMissTurnsPlayer2] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [fetchedDeck, setFetchedDeck] = useState(false);
  const [winner, setWinner] = useState(null);
  const [nrOfFourtPlayed, setNrOfFourtPlayed] = useState(1);
  const [nrOfAcePlayed, setNrOfAcePlayed] = useState(1);

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
      setFetchedDeck(true);
      setMessage(STRINGS.DECK_IS_SHUFFLED);
    } catch (error) {
      console.error("Error fetching deck:", error);
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

      setGameStarted(true);
      setFetchedDeck(false);
      setMessage("");
    }
  };

  const playCard = (cardIndex, name) => {
    if (currentPlayer !== name) {
      setMessage(STRINGS.IT_IS_NOT_YOUR_TURN);
      return;
    }
    if (currentPlayer === player1Name && missTurnsPlayer1 > 0) {
      setMessage(STRINGS.YOU_ARE_BLOCKED);
      setCurrentPlayer(player2Name);
      return;
    } else if (currentPlayer === player2Name && missTurnsPlayer2 > 0) {
      setMessage(STRINGS.YOU_ARE_BLOCKED);
      setCurrentPlayer(player1Name);
      return;
    }
    if (missTurnsPlayer1 > 0 || missTurnsPlayer2 > 0) {
      if (missTurnsPlayer1 > 0) {
        setMissTurnsPlayer1((prevValue) => prevValue - 1);
        setCurrentPlayer(player2Name);
      }
      if (missTurnsPlayer2 > 0) {
        setMissTurnsPlayer2((prevValue) => prevValue - 1);
        setCurrentPlayer(player1Name);
      }
    }
    const currentPlayerHand =
      currentPlayer === player1Name ? player1Hand : player2Hand;
    const playedCard = currentPlayerHand[cardIndex];
    const lastItemIndex = discardPile.length - 1;
    if (
      playedCard.suit === discardPile[lastItemIndex].suit ||
      playedCard.value === discardPile[lastItemIndex].value
    ) {
      if (playedCard.value === "2" || playedCard.value === "3") {
        playTwoOrThree(playedCard, currentPlayerHand, cardIndex);
      } else if (drawRequired) {
        setMessage(STRINGS.YOU_MUST_DRAW_REQUIRED_CARDS);
      } else if (playedCard.value === "4" || playedCard.value === "ACE") {
        playFourOrAce(playedCard, currentPlayerHand, cardIndex);
      } else {
        playNoRuledCard(playedCard, currentPlayerHand, cardIndex);
      }
    } else {
      if (drawRequired) {
        setMessage(STRINGS.YOU_MUST_DRAW_REQUIRED_CARDS);
      } else {
        setMessage(STRINGS.INVALID_MOVE);
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
      setCurrentPlayer(
        currentPlayer === player1Name ? player2Name : player1Name
      );
      setMessage("");
      setDrawRequired(true);
    } else if (playedCard.value === "3") {
      setCardsToDraw(numCardsToDraw);
      setCurrentPlayer(
        currentPlayer === player1Name ? player2Name : player1Name
      );
      setMessage("");
      setDrawRequired(true);
    }
  };

  const playFourOrAce = (playedCard, currentPlayerHand, cardIndex) => {
    const nextPlayer =
      currentPlayer === player1Name ? player2Name : player1Name;
    const currentPlayerHasFour = currentPlayerHand.some(
      (card) => card.value === "4"
    );
    const currentPlayerHasAce = currentPlayerHand.some(
      (card) => card.value === "ACE"
    );
    const nextPlayerHand =
      nextPlayer === player1Name ? player1Hand : player2Hand;
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
        if (currentPlayer === player1Name) {
          setMissTurnsPlayer2(1);
        } else {
          setMissTurnsPlayer1(1);
        }
      } else {
        if (currentPlayer === player1Name) {
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
    } else if (
      playedCard.value === "ACE" &&
      currentPlayerHasAce &&
      !nextPlayerHasAce
    ) {
      if (nrOfAcePlayed === 1) {
        if (currentPlayer === player1Name) {
          setMissTurnsPlayer2(1);
        } else {
          setMissTurnsPlayer1(1);
        }
      } else if (nrOfAcePlayed > 1) {
        if (currentPlayer === player1Name) {
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
    }

    setCurrentPlayer(nextPlayer);
    setDrawRequired(false);
  };

  const playNoRuledCard = (playedCard, currentPlayerHand, cardIndex) => {
    if (missTurnsPlayer1 === 1 || missTurnsPlayer2 === 1) {
      setMissTurnsPlayer1(0);
      setMissTurnsPlayer2(0);
      if (currentPlayer === player1Name) {
        setCurrentPlayer(player2Name);
      } else {
        setCurrentPlayer(player1Name);
      }
    }
    currentPlayerHand.splice(cardIndex, 1);
    const updatedDiscardPile = [...discardPile, playedCard];
    setDiscardPile(updatedDiscardPile);
    if (missTurnsPlayer1 === 0 && missTurnsPlayer2 === 0) {
      setCurrentPlayer(
        currentPlayer === player1Name ? player2Name : player1Name
      );
    }
    setMessage("");
    setDrawRequired(false);
  };

  const drawCard = async () => {
    if (deckSize === 0) {
      setGameEnded(true);
      setWinner(STRINGS.NO_ONE_WINS);
      return;
    }
    if (deckId) {
      const currentPlayerHand =
        currentPlayer === player1Name ? player1Hand : player2Hand;

      if (cardsToDraw > 0) {
        setDeckSize((prevDeckSize) => prevDeckSize - cardsToDraw);
        const drawnCards = await dealCards(deckId, cardsToDraw);
        currentPlayerHand.push(...drawnCards);
        setCardsToDraw(0);
        setCurrentPlayer(
          currentPlayer === player1Name ? player2Name : player1Name
        );
        setMessage("");
        setDrawRequired(false);
      } else {
        setDeckSize((prevDeckSize) => prevDeckSize - 1);
        if (currentPlayer === player1Name && missTurnsPlayer2 > 0) {
          setMissTurnsPlayer2(0);
          const drawnCard = await dealCards(deckId, 1);
          currentPlayerHand.push(drawnCard[0]);
          setCurrentPlayer(player2Name);
          setMessage("");
        } else if (currentPlayer === player2Name && missTurnsPlayer1 > 0) {
          setMissTurnsPlayer1(0);
          const drawnCard = await dealCards(deckId, 1);
          currentPlayerHand.push(drawnCard[0]);
          setCurrentPlayer(player1Name);
          setMessage("");
        } else {
          const drawnCard = await dealCards(deckId, 1);
          currentPlayerHand.push(drawnCard[0]);
          setCurrentPlayer(
            currentPlayer === player1Name ? player2Name : player1Name
          );
          setMessage("");
        }
      }
      setCurrentPlayer(
        currentPlayer === player1Name ? player2Name : player1Name
      );
      setMessage("");
    }
  };

  if (gameEnded) {
    return (
      <GameOver
        winner={winner}
        player1Name={player1Name}
        player2Name={player2Name}
      />
    );
  }

  return (
    <div className={styles["game-container"]}>
      <div className={styles.player1}>
        {gameStarted
          ? currentPlayer === player1Name && (
              <p>
                {STRINGS.IT_IS_YOUR_TURN} <i class="fa fa-hand-o-down"></i>
              </p>
            )
          : ""}
        <h3>{player1Name}</h3>
        <div className="player-cards">
          {player1Hand.map(
            (card, index) => (
              console.log(card),
              (
                <img
                  className={styles["player-cards"]}
                  key={index}
                  src={card.image}
                  alt={`${card.value} of ${card.suit}`}
                  onClick={() => playCard(index, player1Name)}
                />
              )
            )
          )}
        </div>
      </div>
      <div className={styles.center}>
        <div className={styles["discard-pile"]}>
          <h3>{STRINGS.DISCARD_PILE}</h3>
          <div className="discard-cards">
            {discardPile.slice(-6).map((card, index) => (
              <img
                className={styles["discard-cards"]}
                key={index}
                src={card.image}
                alt={`${card.value} of ${card.suit}`}
              />
            ))}
          </div>
        </div>
        <div className={styles.buttons}>
          <button
            onClick={fetchDeck}
            disabled={gameStarted}
            className={gameStarted ? styles["disabled-button"] : ""}
          >
            {STRINGS.FETCH_NEW_DECK}
          </button>
          <button
            onClick={dealInitialCards}
            disabled={!fetchedDeck}
            className={!fetchedDeck ? styles["disabled-button"] : ""}
          >
            {STRINGS.DEAL_CARDS}
          </button>
          <button
            onClick={drawCard}
            disabled={!gameStarted}
            className={!gameStarted ? styles["disabled-button"] : ""}
          >
            {STRINGS.DRAW_CARD}
          </button>
        </div>
        <div className={styles.message}>{message}</div>
      </div>
      <div className={styles.player2}>
        {gameStarted
          ? currentPlayer === player2Name && (
              <p>
                {STRINGS.IT_IS_YOUR_TURN} <i class="fa fa-hand-o-down"></i>
              </p>
            )
          : ""}
        <h3>{player2Name}</h3>
        <div className="player-cards">
          {player2Hand.map((card, index) => (
            <img
              className={styles["player-cards"]}
              key={index}
              src={card.image}
              alt={`${card.value} of ${card.suit}`}
              onClick={() => playCard(index, player2Name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Game;
