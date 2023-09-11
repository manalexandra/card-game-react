import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders PlayerSetUp component initially", () => {
  render(<App />);

  const playerSetUpText = screen.getByText("Enter Player Names");
  expect(playerSetUpText).toBeInTheDocument();
});
