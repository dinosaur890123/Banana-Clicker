const gameData = {
    bananas: 0,
    totalClicks: 0,
    clickLevel: 1,
    lastSaveTime: Date.now(),
    lifetimeBananas: 0,
    bananaPeels: 0,
    buildings: [
        {id: 'cursor', name: 'Cursor', baseCost: 15, cost: 15, rate: 0.5, count: 0, icon: '👆'},
        {id: 'monkey', name: 'Monkey', baseCost: 100, cost: 100, rate: 4, count: 0, icon: '🐒'},
        {id: 'farm', name: 'Banana Farm', baseCost: 1100, cost: 1100, rate: 12, count: 0, icon: '🌴'},
        {id: 'factory', name: 'Factory', baseCost: 12000, cost: 12000, rate: 45, count: 0, icon: '🏭'}
    ],
    upgrades: [
    {
        id: 'iron_mouse',
        name: 'Iron Mouse', 
        cost: 250,
        desc: 'Cursors are 2x efficient', 
        type: 'building', 
        targetIndex: 0,
        multiplier: 2, 
        purchased: false,
        trigger: (data) => data.buildings[0].count >= 1,
        icon: '🖱️'
    },
    {
        id: 'vitamins',
        name: 'Vitamin B',
        cost: 1500, 
        desc: 'Monkeys are 2x efficient',
        type: 'building', 
        targetIndex: 1,
        multiplier: 2, 
        purchased: false, 
        trigger: (data) => data.buildings[1].count >= 5,
        icon: '💊'
    },
    {
        id: 'gmo', 
        name: 'GMO Bananas',
        cost: 15000,
        desc: 'Farms are 2x more efficient', 
        type: 'building',
        targetIndex: 2,
        multiplier: 2, 
        purchased: false,
        trigger: (data) => data.buildings[2].count >= 5,
        icon: '🧬' 
    },
    {
        id: 'thumb_workout', 
        name: 'Thumb workout',
        cost: 1000, 
        desc: 'Clicking is 2x stronger',
        type: 'click', 
        multiplier: 2,
        purchased: false, 
        trigger: (data) => data.totalClicks >= 500,
        icon: '👍'
    }
    ]
};

const scoreElement = document.getElementById('score');
const cursorCostElement = document.getElementById('cursor-cost');
const cursorCountElement = document.getElementById('cursor-count');
const buyCursorButton = document.getElementById('buy-cursor');
const bananaContainer = document.getElementById('banana-container');
let buyMode = 1;
function formatNumber(num) {
    if (num < 1000) return Math.floor(num);
    const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi"];
    const suffixNum = Math.floor(("" + Math.floor(num)).length / 3);
    if (suffixNum >= suffixes.length) return num.toExponential(2);
    let shortValue = parseFloat((suffixNum != 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(3));
    if (shortValue % 1 != 0) {
        shortValue = shortValue.toFixed(1);
    }
    return shortValue + suffixes[suffixNum];
}
function calculatePossiblePeels() {
    return Math.floor(gameData.lifetimeBananas / 100000);
}
function getPrestigeMultiplier() {
    return 1 + (gameData.bananaPeels * 0.1); 
}
function addBananas(amount) {
    gameData.bananas += amount;
    gameData.lifetimeBananas += amount;
}
function getClickPower() {
    let power = Math.floor(1 + (gameData.clickLevel * 1.5));
    gameData.upgrades.forEach(u => {
        if (u.type === 'click' && u.purchased) {
            power *= u.multiplier;
        }
    });
    power *= getPrestigeMultiplier();
    return power;
}
function getClickUpgradeCost() {
    return Math.floor(100 * Math.pow(2, gameData.clickLevel));
}
function calculateBPS() {
    let bps = 0;
    gameData.buildings.forEach((b, index) => {
        let rate = b.rate;
        gameData.upgrades.forEach(u => {
            if (u.type === 'building' && u.targetIndex === index && u.purchased) {
                rate *= u.multiplier;
            };
        });
        bps += (b.count * rate);
    });
    bps *= getPrestigeMultiplier();
    return bps;
}
function getBulkCost(building, amount) {
    if (amount === 'MAX') {
        let affordable = 0;
        let currentCost = building.cost;
        let totalCost = 0;
        let tempBananas = gameData.bananas;
        while (tempBananas >= currentCost && affordable < 100) {
            totalCost += currentCost;
            tempBananas -= currentCost;
            affordable++;
            currentCost = Math.ceil(building.baseCost * Math.pow(1.15, building.count + affordable));
        }
        return {count: affordable, cost: totalCost};
    } else {
        let totalCost = 0;
        let currentCost = building.cost;
        for (let i = 0; i < amount; i++) {
            let nextCost = Math.ceil(building.baseCost * Math.pow(1.15, building.count + i));
            totalCost += nextCost;
        }
        return {count: amount, cost: totalCost};
    }
}
function toggleBuyMode() {
    if (buyMode === 1) buyMode = 10;
    else if (buyMode === 10) buyMode = 'MAX';
    else buyMode = 1;
    const button = document.getElementById('buy-mode-button');
    if (button) button.textContent = `Buy: ${buyMode}`;
    updateUI();
}
function updateUI() {
    document.getElementById('score').textContent = Math.floor(gameData.bananas).toLocaleString();
    const bps = calculateBPS();
    document.getElementById('bps').textContent = bps.toFixed(1);
    document.title = `${Math.floor(gameData.bananas)} Bananas - Tycoon`;
    if (gameData.bananaPeels > 0) {
        document.getElementById('prestige-display').style.display = 'block';
        document.getElementById('peel-count').textContent = gameData.bananaPeels.toLocaleString();
        document.getElementById('peel-bonus').textContent = (gameData.bananaPeels * 10).toLocaleString();
    }
    const potentialPeels = calculatePossiblePeels();
    const newPeels = potentialPeels - gameData.bananaPeels;
    if (gameData.lifetimeBananas >= 100000) {
        document.getElementById('prestige-section').style.display = 'block';
    }

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
    let visibleUpgrades = 0;
    gameData.upgrades.forEach((upgrade, index) => {
        const element = document.getElementById(`upgrade-item-${index}`);
        if (element && !upgrade.purchased) {
            if (upgrade.trigger(gameData)) {
                element.style.display = 'flex';
                visibleUpgrades++;
                if (gameData.bananas >= upgrade.cost) element.classList.remove('disabled');
                else element.classList.add('disabled');
            } else if (element && upgrade.purchased) {
                element.style.display = 'none';
            }
        }
    });
    const upgradeContainer = document.getElementById('upgrades-container');
    if (upgradeContainer) upgradeContainer.style.display = visibleUpgrades > 0 ? 'block' : 'none';

    gameData.buildings.forEach((building, index) => {
        const button = document.getElementById(`button-building-${index}`);
        if (button) {
            const bulk = getBulkCost(building, buyMode);
            let displayCost = bulk.cost;
            let displayCount = bulk.count;
            if (buyMode === 'MAX' && displayCount === 0) {
                displayCost = building.cost;
                displayCount = 1;
            }
            document.getElementById(`cost-building-${index}`).textContent = `Cost: ${building.cost.toLocaleString()} bananas`;
            document.getElementById(`count-building-${index}`).textContent = building.count;
            if (gameData.bananas >= displayCost) {
                button.classList.remove('disabled');
            } else {
                button.classList.add('disabled');
            }
            button.title = `Buy ${displayCount} for ${formatNumber(displayCost)}`;
        }
    });
}
function clickBanana(event) {
    const power = getClickPower();
    gameData.bananas += power;
    gameData.totalClicks++;
    spawnFloatingText(event.clientX, event.clientY, `+${power}`);
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
function buyUpgrade(index) {
    const upgrade = gameData.upgrades[index];
    if (!upgrade.purchased && gameData.bananas >= upgrade.cost) {
        gameData.bananas -= upgrade.cost;
        upgrade.purchased = true;
        const element = document.getElementById(`upgrade-item-${index}`);
        if (element) element.remove();
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
    const upgradeList = document.getElementById('upgrades-list');
    upgradeList.innerHTML = ''
    gameData.upgrades.forEach((building, index) => {
        const item = document.createElement('div');
        item.className = 'shop-item upgrade-item';
        item.id = `upgrade-item-${index}`;
        item.style.display = 'none';
        item.onclick = () => buyUpgrade(index);
        item.innerHTML = `
            <div class="item-info">
                <h3>${upgrade.icon} ${upgrade.name}</h3>
                <p>Cost: ${upgrade.cost.toLocaleString()} bananas</p>
                <p style="font-size:0.7rem; color: #5e5b5b;">${upgrade.desc}</p>
            </div>
        `;
        upgradeList.appendChild(item);
    });
    const list = document.getElementById('buildings-list');
    list.innerHTML = '';
    gameData.buildings.forEach((building, index) => {
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.id = `button-building-${index}`;
        item.onclick = () => buyBuilding(index);
        item.innerHTML = `
        <div class="item-info">
            <h3>${building.icon} ${building.name}</h3>
            <p id="cost-building-${index}">Cost: ${building.cost.toLocaleString()} bananas</p>
            <p style="font-size:0.7rem; color: #928c8c;">+${building.rate} bps</p>
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
        gameData.totalClicks = savedData.totalClicks || 0;
        gameData.lastSaveTime = savedData.lastSaveTime || Date.now();
        if (savedData.buildings) {
            savedData.buildings.forEach((savedB, i) => {
                if (gameData.buildings[i]) {
                    gameData.buildings[i].count = savedB.count;
                    gameData.buildings[i].cost = savedB.cost;
                }
            });
        }
        if (savedData.upgrades) {
            savedData.upgrades.forEach(savedU => {
                const existingUpgrade = gameData.upgrades.find(u => u.id === savedU.id);
                if (existingUpgrade) {
                    existingUpgrade.purchased = savedU.purchased;
                }
            });
        }
        const now = Date.now();
        const diffInSeconds = Math.floor((now - gameData.lastSaveTime) / 1000);
        const bps = calculateBPS();
        if (diffInSeconds > 5 && bps > 0) {
            const offlineEarnings = diffInSeconds * bps;
            gameData.bananas += offlineEarnings;
            showOfflineModal(offlineEarnings, diffInSeconds);
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
function closeModal() {
    document.getElementById('offline-modal').style.display = 'none';
}
function showOfflineModal(bananasEarned, secondsOffline) {
    if (bananasEarned <= 0) return;
    const modal = document.getElementById('offline-modal');
    document.getElementById('offline-bananas').textContent = Math.floor(bananasEarned).toLocaleString();
    document.getElementById('offline-time').textContent = secondsOffline;
    modal.style.display = 'flex';
}
function checkPrestige() {
    const potentialPeels = calculatePossiblePeels();
    const newPeels = potentialPeels - gameData.bananaPeels;
    if (newPeels <= 0) {
        alert("You need more lifetime bananas to earn a new Peel! (Next peel at " + ((gameData.bananaPeels + 1) * 100000).toLocaleString() + " lifetime bananas)");
        return;
    }
    document.getElementById('claimable-peels').textContent = potentialPeels;
    document.getElementById('future-bonus').textContent = (potentialPeels * 10).toLocaleString();
    document.getElementById('prestige-modal').style.display = 'flex';
}
function doPrestige() {
    const potentialPeels = calculatePossiblePeels();
    gameData.bananas = 0;
    gameData.totalClicks = 0;
    gameData.clickLevel = 1;
    gameData.bananaPeels = potentialPeels;
    gameData.buildings.forEach(b => {
        b.count = 0;
        b.cost = b.baseCost;
    });
    gameData.upgrades.forEach(u => u.purchased = false);
    saveGame();
    location.reload();
}
function resetGame() {
    if (confirm("Are you sure you want to reset?")) {
        localStorage.removeItem('bananaTycoonSave');
        location.reload();
    }
}
function spawnGoldenBanana() {
    const golden =  document.createElement('div');
    golden.textContent = '🍌';
    golden.classList.add('golden-banana');
    const x = Math.random() * (window.innerWidth - 100) + 50;
    const y = Math.random() * (window.innerHeight - 100) + 50;
    golden.style.left = `${x}px`;
    golden.style.top = `${y}px`;
    golden.onclick = () => {
        const bps = calculateBPS();
        const reward = bps > 0 ? bps * 60 : 500;
        gameData.bananas += reward;
        spawnFloatingText(x, y, `GOLDEN BANANA! +${Math.floor(reward).toLocaleString()}`);
        updateUI();
        golden.remove();
    };
    document.body.appendChild(golden);
    setTimeout(() => {
        if(golden.parentNode) golden.remove();
    }, 10000);
}
setInterval(() => {
    if(Math.random() > 0.7) {
        spawnGoldenBanana();
    }
}, 10000)
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
}, 10000)
loadGame();
createShop();
updateUI();
