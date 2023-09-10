import "./App.css";
import Game from "./components/Game/Game";
import GameOver from "./components/Game/GameOver";
import PlayerSetUp from "./components/Player/PlayerSetUp.js";
import { useState } from "react";

function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [winner, setWinner] = useState("");

  const handleStartGame = (name1, name2) => {
    setIsGameStarted(true);
    setPlayer1Name(name1);
    setPlayer2Name(name2);
  };

  const handleGameOver = (winner) => {
    setWinner(winner);
  };

  return (
    <div>
      {isGameStarted ? (
        <Game player1Name={player1Name} player2Name={player2Name} />
      ) : winner ? (
        <GameOver
          winner={winner}
          player1Name={player1Name}
          player2Name={player2Name}
          onGameOver={handleGameOver}
        />
      ) : (
        <PlayerSetUp onStartGame={handleStartGame} />
      )}
    </div>
  );
}

export default App;
