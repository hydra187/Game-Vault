const API_KEY = '01099d4e10184b449bd2ca8ec7d43ffd';

const state = {
    games: []
};

// DOM Elements
const els = {
    gameGrid: document.getElementById('gameGrid')
};

// Initialization
async function init() {
    await fetchGames();
}

// API
async function fetchGames() {
    showLoading();
    try {
        const url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=20`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error('Network response was not ok');
        
        const data = await res.json();
        state.games = data.results || [];
        renderGames();
    } catch (error) {
        console.error('Failed to fetch', error);
        els.gameGrid.innerHTML = `
            <div class="no-results">
                <i class="ri-error-warning-line"></i>
                <h3>Error loading games</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

function showLoading() {
    // Generate an array of 8 skeletons while data loads
    els.gameGrid.innerHTML = Array(8).fill(`
        <div class="game-card">
            <div class="game-cover skeleton"></div>
            <div class="game-info">
                <div class="skeleton" style="height:20px; width:40%; margin-bottom:8px"></div>
                <div class="skeleton" style="height:28px; width:80%; margin-bottom:16px"></div>
                <div class="skeleton" style="height:20px; width:100%; margin-top:auto"></div>
            </div>
        </div>
    `).join('');
}

// Rendering
function renderGames() {
    if (!state.games.length) {
        els.gameGrid.innerHTML = `
            <div class="no-results">
                <i class="ri-ghost-line"></i>
                <h3>No games found</h3>
            </div>
        `;
        return;
    }

    // Display fetched data dynamically
    els.gameGrid.innerHTML = state.games.map(game => {
        return `
            <div class="game-card">
                <div class="game-cover">
                    <img src="${game.background_image || 'https://via.placeholder.com/400x200?text=No+Image'}" alt="${game.name}" loading="lazy">
                </div>
                <div class="game-rating-bubble">
                    <i class="ri-star-fill"></i>
                    ${game.rating || 'N/A'}
                </div>
                <div class="game-info">
                    <div class="game-platforms">
                        ${getPlatformIcons(game.parent_platforms)}
                    </div>
                    <h3 class="game-title">${game.name}</h3>
                    <div class="game-meta">
                        <span>${game.released || 'TBA'}</span>
                        <span>${game.genres?.map(g => g.name).slice(0, 2).join(', ') || ''}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getPlatformIcons(parentPlatforms) {
    if (!parentPlatforms) return '';
    const icons = {
        1: 'ri-windows-fill',     
        2: 'ri-playstation-fill', 
        3: 'ri-xbox-fill',        
        7: 'ri-switch-fill'       
    };
    return parentPlatforms
        .map(p => p.platform.id)
        .filter(id => icons[id])
        .map(id => `<i class="${icons[id]}"></i>`)
        .join('');
}

// Start app
init();
