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
    document.title = `${Math.floor(gameData.bananas)} Bananas - Tycoon`;
    const clickCost = getClickUpgradeCost();
    const clickButton = document.getElementById('button-click-upgrade');
    if (clickButton) {
        if (gameData.bananas >= clickCost) {
            clickButton.classList.remove('disabled');
        } else {
            clickButton.classList.add('disabled');
        }
        document.getElementById('click-name').textContent = `Better Clicks (Lvl ${gameData.clickLevel})`;
        document.getElementById('click-cost-text').textContent = `Cost: ${clickCost.toLocaleString()} bananas`;
    }
    gameData.buildings.forEach((building, index) => {
        const button = document.getElementById(`button-building-${index}`);
        if (button) {
            if (gameData.bananas >= building.cost) {
                button.classList.remove('disabled')
            } else {
                button.classList.add('disabled');
            }
            document.getElementById(`cost-building-${index}`).textContent = `Cost: ${building.cost.toLocaleString()} bananas`;
            document.getElementById(`count-building-${index}`).textContent = building.count;
        }
    })
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
    }
}
function buyClickUpgrade() {
    const cost = getClickUpgradeCost();
    if (gameData.bananas >= cost) {
        gameData.bananas -= cost;
        gameData.clickLevel++;
        updateUI();
    }
}
function createShop() {
    const clickContainer = document.getElementById('click-upgrade-container');
    clickContainer.innerHTML = `
    <div id="button-click-upgrade" class="shop-item" onclick="buyClickUpgrade()">
        <div class="item-info">
            <h3 id="click-name">Better Clicks (Lvl 1)</h3>
            <p id="click-cost-text">Cost: 100 bananas</p>
            <p style="font-size:0.7rem; color: #8d8787;">+1.5 Power</p>
        </div>
        <div class="item-count">🖱️</div>
    </div>
    `;
    const list = document.getElementById('buildings-list');
    list.innerHTML = '';
    gameData.buildings.forEach((building, index) => {
        const item = document.createElement('div');item.className = 'shop-item';
        item.id = `button-building-${index}`;
        item.onclick = () => buyBuilding(index);
        item.innerHTML = `
        <div class="item-info">
            <h3>${building.icon} ${building.name}</h3>
            <p id="cost-building-${index}">Cost: ${building.cost.toLocaleString()} bananas</p>
            <p style="font-size:0.7rem; color: #8d8989;">+${building.rate} bps</p>
        </div>
        <div class="item-count" id="count-building-${index}">${building.count}</div>
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
    if (notify) {
        notify.style.opacity = '1';
        setTimeout(() => notify.style.opacity = '0', 2000);
    }
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
createShop();
loadGame();
