import styles from "./GameOver.module.css";
import winnergif from "../assets/winner.gif";

const GameOver = ({ winner, player1Name, player2Name, onGameOver }) => {
  const winningPlayerName = winner === "Player 1" ? player1Name : player2Name;

  return (
    <div className={styles["game-over-container"]}>
      {winner ? (
        <p className={styles.winner}>{`${winningPlayerName} wins!`}</p>
      ) : (
        <p className={styles.winner}>It's a draw!</p>
      )}
      <img src={winnergif} alt="winner" />
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
