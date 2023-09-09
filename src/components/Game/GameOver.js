const GameOver = ({ winner }) => {
  return (
    <div>
      <h2>Game Over!</h2>
      {winner ? (
        <p>{`${winner} wins!`}</p>
      ) : (
        <p>It's a draw!</p>
      )}
    </div>
  );
};

export default GameOver;
