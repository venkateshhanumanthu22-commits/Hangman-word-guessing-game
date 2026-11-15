# Hangman

A browser-based Hangman game using the supplied `words.txt` list. Guess a
hidden word with the on-screen keyboard or your physical keyboard; duplicate
guesses do not cost a turn, and each round allows six incorrect guesses.

## Play the website

Open a terminal in this folder and start Python's built-in local web server:

```text
python -m http.server 8000
```

Then open <http://localhost:8000> in your browser. Keep the terminal running
while you play. Press `Ctrl+C` in that terminal to stop the server.

## Play in the console

The original terminal version is also available:

```text
python hangman.py
```
