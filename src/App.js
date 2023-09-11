import "./App.css";
import Game from "./components/Game/Game";
import PlayerSetUp from "./components/Player/PlayerSetUp.js";
import { useState } from "react";

function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");

  const handleStartGame = (name1, name2) => {
    setIsGameStarted(true);
    setPlayer1Name(name1);
    setPlayer2Name(name2);
  };

  return (
    <div>
      {isGameStarted ? (
        <Game player1Name={player1Name} player2Name={player2Name} />
      ) : (
        <PlayerSetUp onStartGame={handleStartGame} />
      )}
    </div>
  );
}

export default App;
