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
    cursorCountElement.textContent = cursors;
    if (bananas >= cursorCost) {
        buyCursorButton.disabled = false
    } else {
        buyCursorButton.disabled = true;
    }
}
function clickBanana(event) {
    bananas += clickValue;
    spawnFloatingText(event.clientX, event.clientY, `+${clickValue}`);
    updateUI();
}
function buyCursor() {
    if (bananas >= cursorCost) {
        bananas -= cursorCost;
        cursors++;
        cursorCost = Math.floor(cursorCost * 1.2);
        updateUI();
    }
}
function spawnFloatingText(x, y, text) {
    const el = document.createElement('div');
    el.classList.add('click-visual');
    el.textContent = text;
    const randomX = (Math.random() - 0.5) * 20;
    el.style.left = `${x + randomX}px`;
    el.style.top = `${y - 20}px`;
    document.body.appendChild(el);
    setTimeout(() => {
        el.remove();
    }, 1000);
}
setInterval(() => {
    if (cursors > 0) {
        bananas += cursors;
        updateUI();
    }
}, 1000);
updateUI();