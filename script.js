/**
 * Tic-Tac-Toe (2 player, same device) — Keyboard Accessible
 *
 * Keyboard support:
 * - Each cell is focusable (tabindex="0")
 * - Arrow keys move focus within the 3x3 grid
 * - Enter/Space places a mark in the focused cell
 */

let boardState = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;

const boardEl = document.getElementById("board");
const statusLineEl = document.getElementById("statusLine");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restartBtn");

const WIN_PATTERNS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

/**
 * Create the 9 focusable cells and attach mouse + keyboard handlers.
 */
function createBoardUI() {
    boardEl.innerHTML = "";

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.index = String(i);

        // Make it keyboard-focusable
        cell.tabIndex = 0;
        cell.setAttribute("role", "button");
        cell.setAttribute("aria-label", `Cell ${i + 1}`);

        // Click places a mark
        cell.addEventListener("click", () => attemptMove(i));

        // Keydown: arrows move focus; Enter/Space places mark
        cell.addEventListener("keydown", (e) => handleCellKeydown(e, i));

        boardEl.appendChild(cell);
    }
}

/**
 * Keyboard handler for a specific cell index.
 */
function handleCellKeydown(event, index) {
    const key = event.key;

    // Enter/Space => attempt to place a mark
    if (key === "Enter" || key === " ") {
        event.preventDefault(); // prevent scrolling on Space
        attemptMove(index);
        return;
    }

    // Arrow keys move focus within the grid
    const nextIndex = getNextIndexFromArrow(key, index);
    if (nextIndex !== null) {
        event.preventDefault();
        focusCell(nextIndex);
    }
}

/**
 * Given an arrow key and current index, compute where focus should go.
 * Grid indices:
 * 0 1 2
 * 3 4 5
 * 6 7 8
 */
function getNextIndexFromArrow(key, index) {
    const row = Math.floor(index / 3);
    const col = index % 3;

    switch (key) {
        case "ArrowUp":
            return row > 0 ? index - 3 : index;
        case "ArrowDown":
            return row < 2 ? index + 3 : index;
        case "ArrowLeft":
            return col > 0 ? index - 1 : index;
        case "ArrowRight":
            return col < 2 ? index + 1 : index;
        default:
            return null;
    }
}

/**
 * Focus a specific cell element by index.
 */
function focusCell(index) {
    const cellEl = boardEl.querySelector(`.cell[data-index="${index}"]`);
    if (cellEl) cellEl.focus();
}

/**
 * Attempt to make a move at a given index.
 * This is shared by both mouse click and keyboard actions.
 */
function attemptMove(index) {
    if (gameOver) {
        flashMessage("Game over — press Restart to play again.");
        return;
    }

    if (boardState[index] !== "") {
        flashMessage("That square is already taken!");
        return;
    }

    boardState[index] = currentPlayer;
    render();

    const winner = checkWinner(boardState);
    if (winner) {
        gameOver = true;
        statusLineEl.innerHTML = `<strong>Result:</strong> ${winner} wins 🎉`;
        disableBoard();
        // Keep focus on the cell just played (already focused if keyboard-used)
        return;
    }

    if (isDraw(boardState)) {
        gameOver = true;
        statusLineEl.innerHTML = `<strong>Result:</strong> Draw (tie) 🤝`;
        disableBoard();
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateTurnText();
    clearMessage();
}

/**
 * Check for a winner (rows/cols/diagonals).
 */
function checkWinner(state) {
    for (const [a, b, c] of WIN_PATTERNS) {
        if (state[a] && state[a] === state[b] && state[a] === state[c]) {
            return state[a];
        }
    }
    return "";
}

function isDraw(state) {
    return state.every(cell => cell !== "");
}

/**
 * Reset game state + UI and put focus back on the first cell
 * so keyboard players can immediately start.
 */
function resetGame() {
    boardState = Array(9).fill("");
    currentPlayer = "X";
    gameOver = false;

    render();
    updateTurnText();
    clearMessage();
    enableBoard();

    // Great for keyboard-only flow: focus the first cell
    focusCell(0);
}

/**
 * Render board state into the UI (text + X/O classes).
 */
function render() {
    const cells = boardEl.querySelectorAll(".cell");
    cells.forEach((cellEl, i) => {
        const value = boardState[i];
        cellEl.textContent = value;

        cellEl.classList.remove("x", "o");
        if (value === "X") cellEl.classList.add("x");
        if (value === "O") cellEl.classList.add("o");
    });
}

function updateTurnText() {
    statusLineEl.innerHTML = `<strong>Turn:</strong> ${currentPlayer}`;
}

function disableBoard() {
    boardEl.querySelectorAll(".cell").forEach(cell => {
        cell.classList.add("disabled");
        // Keep focusability for reading/announcing; but you could also set tabIndex = -1
        // If you prefer to remove from tab order after game ends, uncomment below:
        // cell.tabIndex = -1;
    });
}

function enableBoard() {
    boardEl.querySelectorAll(".cell").forEach(cell => {
        cell.classList.remove("disabled");
        // Ensure cells are focusable again if you changed tabIndex in disableBoard()
        cell.tabIndex = 0;
    });
}

function flashMessage(text) {
    messageEl.textContent = text;
}

function clearMessage() {
    messageEl.textContent = "";
}

restartBtn.addEventListener("click", resetGame);

// Init
createBoardUI();
resetGame();
