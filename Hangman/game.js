const MAX_MISTAKES = 6;
const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const wordElement = document.querySelector("#word");
const keyboardElement = document.querySelector("#keyboard");
const messageElement = document.querySelector("#game-message");
const mistakesElement = document.querySelector("#mistakes-count");
const drawingTitle = document.querySelector("#drawing-title");
const drawingCaption = document.querySelector("#drawing-caption");
const newGameButton = document.querySelector("#new-game");
const bodyParts = [...document.querySelectorAll(".person")];

let words = [];
let secretWord = "";
let guessedLetters = new Set();
let mistakes = 0;
let round = 0;
let gameOver = false;

function setMessage(text, tone = "") {
  messageElement.textContent = text;
  messageElement.className = `hint${tone ? ` ${tone}` : ""}`;
}

function drawWord() {
  wordElement.replaceChildren();
  for (const letter of secretWord) {
    const tile = document.createElement("span");
    const revealed = guessedLetters.has(letter);
    tile.className = `word-letter${revealed ? " revealed" : ""}${gameOver && !revealed ? " missed" : ""}`;
    tile.textContent = revealed || gameOver ? letter : "";
    tile.setAttribute("aria-hidden", "true");
    wordElement.append(tile);
  }
  const accessibleWord = [...secretWord]
    .map((letter) => guessedLetters.has(letter) || gameOver ? letter : "blank")
    .join(" ");
  wordElement.setAttribute("aria-label", `Word: ${accessibleWord}`);
}

function drawKeyboard() {
  keyboardElement.replaceChildren();
  for (const letter of LETTERS) {
    const key = document.createElement("button");
    key.type = "button";
    key.className = "key";
    key.textContent = letter;
    key.setAttribute("aria-label", `Guess ${letter.toUpperCase()}`);
    key.disabled = gameOver || guessedLetters.has(letter);
    if (guessedLetters.has(letter)) {
      key.classList.add(secretWord.includes(letter) ? "correct" : "incorrect");
    }
    key.addEventListener("click", () => makeGuess(letter));
    keyboardElement.append(key);
  }
}

function updateDrawing() {
  bodyParts.forEach((part, index) => part.classList.toggle("visible", index < mistakes));
  mistakesElement.replaceChildren(
    document.createTextNode(String(mistakes)),
    Object.assign(document.createElement("span"), { textContent: ` / ${MAX_MISTAKES}` }),
  );
  drawingTitle.textContent = `Hangman drawing, ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"}`;
  const captions = [
    "A fresh start. You’ve got this.",
    "One little slip. Keep going.",
    "Still plenty of chances.",
    "Take your time. Think it through.",
    "Getting close. Choose carefully.",
    "One last chance!",
    "That’s the end of this round.",
  ];
  drawingCaption.textContent = captions[mistakes];
}

function finishRound(won) {
  gameOver = true;
  drawWord();
  drawKeyboard();
  if (won) {
    setMessage("Lovely work! You found the word.", "success");
  } else {
    setMessage(`The word was “${secretWord}”. Try another?`, "error");
  }
  updateDrawing();
}

function makeGuess(letter) {
  if (gameOver || guessedLetters.has(letter)) return;
  guessedLetters.add(letter);

  if (secretWord.includes(letter)) {
    if ([...secretWord].every((character) => guessedLetters.has(character))) {
      finishRound(true);
    } else {
      setMessage(`Good guess — “${letter.toUpperCase()}” is in the word.`, "success");
      drawWord();
      drawKeyboard();
    }
  } else {
    mistakes += 1;
    if (mistakes === MAX_MISTAKES) {
      finishRound(false);
    } else {
      setMessage(`No “${letter.toUpperCase()}” this time. Keep looking.`, "error");
      drawWord();
      drawKeyboard();
      updateDrawing();
    }
  }
}

function startRound() {
  if (!words.length) return;
  let nextWord = words[Math.floor(Math.random() * words.length)];
  if (words.length > 1 && nextWord === secretWord) {
    const currentIndex = words.indexOf(nextWord);
    nextWord = words[(currentIndex + 1 + Math.floor(Math.random() * (words.length - 1))) % words.length];
  }
  secretWord = nextWord;
  guessedLetters = new Set();
  mistakes = 0;
  gameOver = false;
  round += 1;
  document.querySelector("#round-badge").textContent = `ROUND ${round}`;
  setMessage("Pick a letter to make your first guess.");
  drawWord();
  drawKeyboard();
  updateDrawing();
}

async function initialize() {
  newGameButton.disabled = true;
  setMessage("Getting your word list ready…");
  try {
    const response = await fetch("./words.txt");
    if (!response.ok) throw new Error(`Could not load words.txt (HTTP ${response.status}).`);
    words = (await response.text())
      .split(/\r?\n/)
      .map((word) => word.trim().toLowerCase())
      .filter((word) => /^[a-z]+$/.test(word));
    if (!words.length) throw new Error("The word list is empty.");
    newGameButton.disabled = false;
    startRound();
  } catch (error) {
    console.error(error);
    setMessage("Couldn't load the word list. Run the local server from the project folder and refresh.", "error");
  }
}

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  const letter = event.key.toLowerCase();
  if (/^[a-z]$/.test(letter)) makeGuess(letter);
});
newGameButton.addEventListener("click", startRound);

initialize();
