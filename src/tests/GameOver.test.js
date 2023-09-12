import React from "react";
import { render, screen } from "@testing-library/react";
import GameOver from "../components/Game/GameOver";
import { STRINGS } from "../constants/Strings";

describe("GameOver Component", () => {
  it("renders with a winner", () => {
    const player1Name = "John";
    const player2Name = "Jane";

    render(
      <GameOver
        winner={player1Name}
        player1Name={player1Name}
        player2Name={player2Name}
      />
    );

    const winnerText = screen.getByText("John wins!");
    const winnerImage = screen.getByAltText("Winner");
    expect(winnerText).toBeInTheDocument();
    expect(winnerImage).toBeInTheDocument();
  });
  it("renders with a draw", () => {
    const winner = STRINGS.NO_ONE_WINS;

    render(<GameOver winner={winner} />);

    const winnerText = screen.getByText(STRINGS.IT_IS_A_DRAW);
    const winnerImage = screen.getByAltText("It's a draw");
    expect(winnerText).toBeInTheDocument();
    expect(winnerImage).toBeInTheDocument();
  });
});
