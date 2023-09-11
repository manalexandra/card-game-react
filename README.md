CARD GAME

This is a simple card game application built with React that follows specific rules for gameplay. Players are dealt cards, and they take turns playing cards following certain rules until one player wins.

GAMEPLAY RULES

- Shuffling Cards: The game starts with a shuffle of the deck. There are no hardcoded card values.
- Dealing Cards: Two players are dealt 5 cards each at the beginning of the game.
- Discard Pile: The first card in the deck after dealing becomes the top card in the discard pile.
- Playing Cards: Players can play cards on their turn. They must play a card of the same suit or the same value as the card on top of the discard pile. For example, if the top card is a 7 of spades, a player can play a 9 of spades or a 7 of clubs.
- Drawing Cards: If a player cannot play a card, they must draw from the deck.

Special Cards (2 and 3):

- If a 2 is played, the next player must pick up 2 cards unless they have a 2, in which case they add to the original 2, and the next player picks up 4 cards, and so on.
- If a 3 is played, the next player must pick up 3 cards unless they have a 3, in which case they add to the original 3, and the next player picks up 6 cards, and so on.

Special Cards (4 and Ace):

- If a 4 or Ace is played, the next player misses a turn unless they have a 4 or an Ace, in which case they add to the original 4 or Ace, and the next player in sequence misses 2 turns.

Winning

The game ends when one player has played all of their cards.

GETTING STARTED

Clone the repository to your local machine

Install the required dependencies:

- npm install

Start the React application:

- npm start

Open your browser and visit http://localhost:3000 to play the game.

Running tests:

- npm test

Technologies Used
React
HTML/CSS
