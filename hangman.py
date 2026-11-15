"""Play Hangman in the terminal using the words in words.txt."""

import random
from pathlib import Path

MAX_MISTAKES = 6
WORDS_PATH = Path(__file__).with_name("words.txt")

HANGMAN_STAGES = (
    """
     +---+
     |   |
         |
         |
         |
    =======
    """,
    """
     +---+
     |   |
     O   |
         |
         |
    =======
    """,
    """
     +---+
     |   |
     O   |
     |   |
         |
    =======
    """,
    """
     +---+
     |   |
     O   |
    /|   |
         |
    =======
    """,
    """
     +---+
     |   |
     O   |
    /|\\  |
         |
    =======
    """,
    """
     +---+
     |   |
     O   |
    /|\\  |
    /    |
    =======
    """,
    """
     +---+
     |   |
     O   |
    /|\\  |
    / \\  |
    =======
    """,
)


def load_words():
    """Load alphabetic words from the bundled word list."""
    try:
        words = [
            line.strip().lower()
            for line in WORDS_PATH.read_text(encoding="utf-8").splitlines()
            if line.strip().isalpha()
        ]
    except OSError as error:
        raise SystemExit(f"Could not read the word list at {WORDS_PATH}: {error}") from error

    if not words:
        raise SystemExit(f"The word list at {WORDS_PATH} contains no usable words.")
    return words


def show_game(word, guessed_letters, mistakes):
    """Display the current gallows, masked word, and guessed letters."""
    print(HANGMAN_STAGES[mistakes])
    print("Word: " + " ".join(letter if letter in guessed_letters else "_" for letter in word))
    print(f"Mistakes remaining: {MAX_MISTAKES - mistakes}")
    if guessed_letters:
        print("Guessed letters: " + " ".join(sorted(guessed_letters)))


def play_round(words):
    """Play one round and return whether the player won."""
    word = random.choice(words)
    guessed_letters = set()
    mistakes = 0

    while mistakes < MAX_MISTAKES and not all(letter in guessed_letters for letter in word):
        show_game(word, guessed_letters, mistakes)
        guess = input("Guess a letter (or enter QUIT to end the round): ").strip().lower()

        if guess == "quit":
            print(f"Round ended. The word was: {word}")
            return None
        if len(guess) != 1 or not guess.isalpha():
            print("Please enter one letter.")
            continue
        if guess in guessed_letters:
            print(f"You already guessed '{guess}'. Try a different letter.")
            continue

        guessed_letters.add(guess)
        if guess not in word:
            mistakes += 1
            print(f"Sorry, '{guess}' is not in the word.")
        else:
            print(f"Good guess! '{guess}' is in the word.")

    show_game(word, guessed_letters, mistakes)
    if all(letter in guessed_letters for letter in word):
        print(f"You win! You guessed the word: {word}")
        return True

    print(f"Game over! The word was: {word}")
    return False


def main():
    words = load_words()
    print("=== Hangman ===")
    print(f"Guess the hidden word one letter at a time. You have {MAX_MISTAKES} incorrect guesses.")

    while True:
        result = play_round(words)
        if result is None:
            break
        if input("Play again? (y/n): ").strip().lower() not in ("y", "yes"):
            break
    print("Thanks for playing!")


if __name__ == "__main__":
    main()
