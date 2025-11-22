let bananas = 0;
let clickValue = 1;
let cursorCost = 15;
let cursors = 0;

const scoreElement = document.getElementById('score');
const cursorCostElement = document.getElementById('cursor-cost');
const cursorCountElement = document.getElementById('cursor-count');
const buyCursorButton = document.getElementById('buy-cursor');
const bananaContainer = document.getElementById('banana-container');

function updateUI() {
    scoreElement.textContent = Math.floor(bananas);
    cursorCostElement.textContent = cursorCost;
}