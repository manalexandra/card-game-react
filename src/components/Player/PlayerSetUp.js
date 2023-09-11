import { useState } from "react";
import styles from "./PlayerSetUp.module.css";
import { STRINGS } from "../../constants/Strings";

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
      setMessage(STRINGS.ERROR_ENTER_NAME_FOR_PLAYERS);
    } else {
      onStartGame(player1Name, player2Name);
    }
  };

  return (
    <div className={styles["start-page"]}>
      <div className={styles["start-page-container"]}>
        <h2>{STRINGS.ENTER_PLAYER_NAMES}</h2>
        <div className={styles["player-name"]}>
          <label>{STRINGS.ENTER_PLAYER1_NAME}</label>
          <input
            type="text"
            value={player1Name}
            onChange={handlePlayer1NameChange}
          />
        </div>
        <div className={styles["player-name"]}>
          <label>{STRINGS.ENTER_PLAYER2_NAME}</label>
          <input
            type="text"
            value={player2Name}
            onChange={handlePlayer2NameChange}
          />
        </div>
        <button className={styles["player-name"]} onClick={handleStartGame}>
          {STRINGS.START_GAME}
        </button>
      </div>
      <div className={styles.message}>{message}</div>
    </div>
  );
};

export default PlayerSetupPage;
