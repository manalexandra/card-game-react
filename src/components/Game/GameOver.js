import styles from "./GameOver.module.css";
import winnergif from "../assets/winner.gif";
import drawgif from "../assets/draw.gif";
import { STRINGS } from "../../constants/Strings";

const GameOver = ({ winner, player1Name, player2Name }) => {
  const winningPlayerName = winner === "Player 1" ? player1Name : player2Name;

  return (
    <div className={styles["game-over-container"]}>
      {winner === STRINGS.NO_ONE_WINS ? (
        <>
          <p className={styles.winner}>{STRINGS.IT_IS_A_DRAW}</p>
          <img className={styles["draw-gif"]} src={drawgif} alt="It's a draw" />
        </>
      ) : (
        <>
          <p className={styles.winner}>{`${winningPlayerName} wins!`}</p>
          <img className={styles["winner-gif"]} src={winnergif} alt="Winner" />
        </>
      )}
      <button
        className={styles["play-again-btn"]}
        onClick={() => window.location.reload()}
      >
        Play Again
      </button>
    </div>
  );
};

export default GameOver;
