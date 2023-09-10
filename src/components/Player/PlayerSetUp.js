import { useState } from "react";
import styles from "./PlayerSetUp.module.css";

const PlayerSetupPage = ({ onStartGame }) => {
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [message, setMessage] = useState("");

  const handlePlayer1NameChange = (event) => {
    setPlayer1Name(event.target.value);
  };

  const handlePlayer2NameChange = (event) => {
    setPlayer2Name(event.target.value);
  };

  const handleStartGame = () => {
    if (player1Name.trim() === "" || player2Name.trim() === "") {
      setMessage("Please enter a name for both players.");
    } else {
      onStartGame(player1Name, player2Name);
    }
  };

  return (
    <div className={styles["start-page"]}>
      <div className={styles["start-page-container"]}>
        <h2>Enter Player Names</h2>
        <div className={styles["player-name"]}>
          <label>Player 1 Name: </label>
          <input
            type="text"
            value={player1Name}
            onChange={handlePlayer1NameChange}
          />
        </div>
        <div className={styles["player-name"]}>
          <label>Player 2 Name: </label>
          <input
            type="text"
            value={player2Name}
            onChange={handlePlayer2NameChange}
          />
        </div>
        <button className={styles["player-name"]} onClick={handleStartGame}>
          Start Game
        </button>
      </div>
      <div className={styles.message}>{message}</div>
    </div>
  );
};

export default PlayerSetupPage;
