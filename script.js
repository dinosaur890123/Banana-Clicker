const gameData = {
    bananas: 0,
    totalClicks: 0,
    clickLevel: 1,
    buildings: [
        {id: 'cursor', name: 'Cursor', baseCost: 15, cost: 15, rate: 0.5, count: 0, icon: '👆'},
        {id: 'monkey', name: 'Monkey', baseCost: 100, cost: 100, rate: 4, count: 0, icon: '🐒'},
        {id: 'farm', name: 'Banana Farm', baseCost: 1100, cost: 1100, rate: 12, count: 0, icon: '🌴'},
        {id: 'factory', name: 'Factory', baseCost: 12000, cost: 12000, rate: 45, count: 0, icon: '🏭'}
    ]
}

const scoreElement = document.getElementById('score');
const cursorCostElement = document.getElementById('cursor-cost');
const cursorCountElement = document.getElementById('cursor-count');
const buyCursorButton = document.getElementById('buy-cursor');
const bananaContainer = document.getElementById('banana-container');

function getClickPower() {
    return Math.floor(1 + (gameData.clickLevel * 1.5));
}
function getClickUpgradeCost() {
    return Math.floor(100 * Math.pow(2, gameData.clickLevel));
}
function updateUI() {
    document.getElementById('score').textContent = Math.floor(gameData.bananas).toLocaleString();
    let bps = 0;
    gameData.buildings.forEach(b => bps += (b.count * b.rate));
    document.getElementById('bps').textContent = bps.toFixed(1);
    renderShop();
    document.title = `${Math.floor(gameData.bananas)} Bananas - Tycoon`;
}
function clickBanana(event) {
    const power = getClickPower();
    gameData.bananas += power;
    gameData.totalClicks++;
    spawnFloatingText(event.clientX, event.clientY, `+${clickValue}`);
    updateUI();
}
function buyBuilding(index) {
    const building = gameData.buildings[index];
    if (gameData.bananas >= building.cost) {
        gameData.bananas -= building.cost;
        building.count++;
        building.cost = Math.ceil(building.baseCost * Math.pow(1.15, building.count));
        updateUI();
        renderShop();
    }
}
function buyClickUpgrade() {
    const cost = getClickUpgradeCost();
    if (gameData.bananas >= cost) {
        gameData.bananas -= cost;
        gameData.clickLevel++;
        updateUI();
        renderShop();
    }
}
function renderShop() {
    const clickContainer = document.getElementById('click-upgrade-container');
    const clickCost = getClickUpgradeCost();
    const canAffordClick = gameData.bananas >= clickCost;
    clickContainer.innerHTML = `
    <div class="shop-item ${canAffordClick ? '' : 'disabled'}" onclick="buyClickUpgrade()">
        <div class="item-info">
            <h3>Better Clicks (Lvl ${gameData.clickLevel})</h3>
            <p>Cost: ${clickCost} bananas</p>
            <p style="font-size:0.7rem; color:#888;">+1.5 power</p>
        </div>
        <div class="item-count">🖱️</div>
    </div>
    `;
    const list = document.getElementById('buildings-list');
    list.innerHTML = '';
    gameData.buildings.forEach((building, index) => {
        const canAfford = gameData.bananas >= building.cost;
        const item = document.createElement('div');
        item.className = `shop-item ${canAfford ? '' : 'disabled'}`;
        item.onclick = () => {if(canAfford) buyBuilding(index);};
        item.innerHTML = `
        <div class="item-info">
            <h3>${building.icon} ${building.name}</h3>
            <p>Cost: ${building.cost.toLocaleString()} bananas</p>
            <p style="font-size:0.7rem; color: #8d8585;">+${building.rate} bps</p>
        </div>
        <div class="item-count">${building.count}</div>
        `;
        list.appendChild(item);
    });
}
function loadGame() {
    const saveString = localStorage.getItem('bananaTycoonSave');
    if (saveString) {
        const savedData = JSON.parse(saveString);
        gameData.bananas = savedData.bananas;
        gameData.clickLevel = savedData.clickLevel || 1;
        if (savedData.building) {
            savedData.forEach((savedB, i) => {
                if (gameData.buildings[i]) {
                    gameData.buildings[i].count = savedB.count;
                    gameData.buildings[i].cost = savedB.cost;
                }
            })
        }
    }
}
function saveGame() {
    localStorage.setItem('bananaTycoonSave', JSON.stringify(gameData));
    const notify = document.getElementById('save-notify');
    notify.style.opacity = '1';
    setTimeout(() => notify.style.opacity = '0', 2000);
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
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}
function resetGame() {
    if (confirm("Are you sure you want to reset?")) {
        localStorage.removeItem('bananaTycoonSave');
        location.reload();
    }
}
setInterval(() => {
    let bps = 0;
    gameData.buildings.forEach(b => bps += (b.count * b.rate));
    if (bps > 0) {
        gameData.bananas += bps;
        updateUI();
    }
}, 1000);
setInterval(() => {
    saveGame();
})

updateUI();
renderShop();
loadGame();
