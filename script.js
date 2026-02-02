/**
 * Tic-Tac-Toe (2 player, same device)
 *
 * Key design points:
 * - Board state is stored in an array of 9 items ("" | "X" | "O")
 * - currentPlayer toggles between "X" and "O"
 * - gameOver prevents moves after win/draw
 * - checkWinner() checks rows/cols/diagonals
 * - resetGame() clears state + UI
 */

// ----- Game State -----
let boardState = Array(9).fill(""); // 9 cells, empty at start
let currentPlayer = "X";            // X starts
let gameOver = false;               // when true, no more moves

// ----- DOM References -----
const boardEl = document.getElementById("board");
const statusLineEl = document.getElementById("statusLine");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

// ----- Win patterns (indices in the 1D array) -----
const WIN_PATTERNS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
];

/**
 * Build the 9 clickable cell elements once.
 * This keeps things clean: we only update text/classes after.
 */
function createBoardUI() {
    boardEl.innerHTML = ""; // safety: clear existing
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.setAttribute("role", "button");
        cell.setAttribute("aria-label", `Cell ${i + 1}`);
        cell.dataset.index = String(i);

        // Click handler for placing marks
        cell.addEventListener("click", onCellClick);

        boardEl.appendChild(cell);
    }
}

/**
 * Handle a cell click:
 * - ignore if game is over
 * - ignore if the cell already has a mark
 * - place mark, check win/draw, otherwise swap turn
 */
function onCellClick(event) {
    const index = Number(event.currentTarget.dataset.index);

    // If game ended, block moves
    if (gameOver) {
        flashMessage("Game over — press Restart to play again.");
        return;
    }

    // Prevent illegal moves (occupied cell)
    if (boardState[index] !== "") {
        flashMessage("That square is already taken!");
        return;
    }

    // Place the current player's mark in state
    boardState[index] = currentPlayer;

    // Update the UI for this single cell
    render();

    // Check if current move ended the game
    const winner = checkWinner(boardState);

    if (winner) {
        // Someone won
        gameOver = true;
        statusLineEl.innerHTML = `<strong>Result:</strong> ${winner} wins 🎉`;
        disableBoard();
        return;
    }

    if (isDraw(boardState)) {
        // Draw
        gameOver = true;
        statusLineEl.innerHTML = `<strong>Result:</strong> Draw (tie) 🤝`;
        disableBoard();
        return;
    }

    // Otherwise, swap turns
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateTurnText();
    clearMessage();
}

/**
 * Check for a winner using the win patterns.
 * Returns "X", "O", or "" (no winner).
 */
function checkWinner(state) {
    for (const [a, b, c] of WIN_PATTERNS) {
        if (state[a] && state[a] === state[b] && state[a] === state[c]) {
            return state[a];
        }
    }
    return "";
}

/**
 * A draw occurs if all squares are filled and no winner.
 */
function isDraw(state) {
    return state.every(cell => cell !== "");
}

/**
 * Reset game state + UI so a new game starts immediately.
 * Can be used mid-game or after game ends.
 */
function resetGame() {
    boardState = Array(9).fill("");
    currentPlayer = "X";
    gameOver = false;

    // Reset UI
    render();
    updateTurnText();
    clearMessage();
    enableBoard();
}

/**
 * Update all cells to match boardState.
 */
function render() {
    const cells = boardEl.querySelectorAll(".cell");
    cells.forEach((cellEl, i) => {
        const value = boardState[i];
        cellEl.textContent = value;

        // Remove old classes, then re-add based on mark
        cellEl.classList.remove("x", "o");
        if (value === "X") cellEl.classList.add("x");
        if (value === "O") cellEl.classList.add("o");
    });
}

/**
 * Turn indicator text while game is active.
 */
function updateTurnText() {
    statusLineEl.innerHTML = `<strong>Turn:</strong> ${currentPlayer}`;
}

/**
 * Disable board interaction after game end.
 * (Still allows Restart immediately.)
 */
function disableBoard() {
    boardEl.querySelectorAll(".cell").forEach(cell => cell.classList.add("disabled"));
}

function enableBoard() {
    boardEl.querySelectorAll(".cell").forEach(cell => cell.classList.remove("disabled"));
}

/**
 * Show a short message; used for illegal moves or clicking after game over.
 */
function flashMessage(text) {
    messageEl.textContent = text;
}

function clearMessage() {
    messageEl.textContent = "";
}

// ----- Wire up the Restart button -----
restartBtn.addEventListener("click", resetGame);

// ----- Initialize the game -----
createBoardUI();
resetGame();
