"use strict";
// DOM
const app = document.getElementById('app');
const next = document.getElementById('next');
const autoplay = document.getElementById('autoplay');
const state = document.getElementsByName('state');
// Timers
let isAutoplay = false;
let interval;
// Constants
const BOARD_ROWS = 32;
const BOARD_COLS = 32;
const stateColors = ['#202020', '#5050FF'];
// Canvas
app.width = 500;
app.height = 500;
const CELL_WIDTH = app.width / BOARD_COLS;
const CELL_HEIGHT = app.height / BOARD_ROWS;
// Boards
const ctx = app.getContext('2d');
let currentBoard = createBoard();
let nextBoard = createBoard();
// Game of Life Rules
const GoL = [
    {
        '53': 1,
        default: 0,
    },
    {
        '62': 1,
        '53': 1,
        default: 0,
    },
];
// * Functions
function createBoard() {
    const board = [];
    for (let i = 0; i < BOARD_ROWS; i++) {
        const row = new Array(BOARD_COLS).fill(0);
        board.push(row);
    }
    return board;
}
function countNbors(board, nbors, r0, c0) {
    nbors.fill(0);
    for (let deltaR = -1; deltaR <= 1; deltaR++) {
        for (let deltaC = -1; deltaC <= 1; deltaC++) {
            if (deltaR !== 0 || deltaC !== 0) {
                const r = r0 + deltaR;
                const c = c0 + deltaC;
                if (0 < r && r < BOARD_ROWS) {
                    if (0 < c && c < BOARD_COLS) {
                        nbors[board[r][c]] += 1;
                    }
                }
            }
        }
    }
}
function computeNextBoardGoL(current, next) {
    const nbors = new Array(2).fill(0);
    for (let r = 0; r < BOARD_ROWS; ++r) {
        for (let c = 0; c < BOARD_COLS; ++c) {
            countNbors(current, nbors, r, c);
            const transition = GoL[current[r][c]];
            next[r][c] = transition[nbors.join('')];
            if (next[r][c] === undefined) {
                next[r][c] = transition['default'];
            }
        }
    }
}
function render(ctx, board) {
    ctx.fillStyle = '#202020';
    ctx.fillRect(0, 0, app.width, app.height);
    ctx.fillStyle = '#f50f50';
    for (let row = 0; row < BOARD_ROWS; ++row) {
        for (let col = 0; col < BOARD_COLS; ++col) {
            const x = col * CELL_WIDTH;
            const y = row * CELL_HEIGHT;
            ctx.fillStyle = stateColors[board[row][col]];
            ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
        }
    }
}
function toggleAutoPlay() {
    if (interval) {
        clearInterval(interval);
    }
    if (!isAutoplay) {
        isAutoplay = true;
        autoplay.textContent = 'Stop';
        interval = setInterval(() => {
            computeNextBoardGoL(currentBoard, nextBoard);
            [currentBoard, nextBoard] = [nextBoard, currentBoard];
            render(ctx, currentBoard);
        }, 300);
        return;
    }
    if (isAutoplay) {
        isAutoplay = false;
        autoplay.textContent = 'Start';
        clearInterval(interval);
        return;
    }
}
// * Events
app.addEventListener('click', (e) => {
    const col = Math.floor(e.offsetX / CELL_WIDTH);
    const row = Math.floor(e.offsetY / CELL_HEIGHT);
    for (let i = 0; i < state.length; ++i) {
        if (state[i].checked) {
            currentBoard[row][col] = i;
            render(ctx, currentBoard);
            return;
        }
    }
});
next.addEventListener('click', () => {
    computeNextBoardGoL(currentBoard, nextBoard);
    [currentBoard, nextBoard] = [nextBoard, currentBoard];
    render(ctx, currentBoard);
});
autoplay.addEventListener('click', () => {
    toggleAutoPlay();
});
// Initial Render
render(ctx, currentBoard);
