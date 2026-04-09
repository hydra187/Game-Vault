const API_KEY = '01099d4e10184b449bd2ca8ec7d43ffd';

const state = {
    games: [],
    displayedGames: [],
    favorites: []
};

// DOM Elements
const els = {
    gameGrid: document.getElementById('gameGrid'),
    searchInput: document.getElementById('searchInput'),
    platformFilter: document.getElementById('platformFilter'),
    sortSelect: document.getElementById('sortSelect'),
    themeToggle: document.getElementById('themeToggle')
};

// Initialization
async function init() {
    loadFavorites(); // Ensure favorites are loaded (feature was missing initialization)
    addEventListeners();
    await fetchGames();
}

// Utility: Debounce function for search
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

// API
// API
// Note: Fetch 100 items here so there's enough data to filter and search locally using HOFs
async function fetchGames() {
    showLoading();
    try {
        let url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=100`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error('Network response was not ok');
        
        const data = await res.json();
        state.games = data.results || [];
        state.displayedGames = [...state.games];
        applyFiltersAndSort(); // Make sure current sort is applied after fetching
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
    if (!state.displayedGames.length) {
        els.gameGrid.innerHTML = `
            <div class="no-results">
                <i class="ri-ghost-line"></i>
                <h3>No games found</h3>
            </div>
        `;
        return;
    }

    // Display fetched data dynamically
    els.gameGrid.innerHTML = state.displayedGames.map(game => {
        const isFav = state.favorites.includes(String(game.id));
        return `
            <div class="game-card">
                <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${game.id}" aria-label="Favorite">
                    <i class="ri-heart-3-line"></i>
                </button>
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

// Event Listeners
// Event Listeners
function addEventListeners() {
    if(els.searchInput) els.searchInput.addEventListener('input', handleSearchInput);
    if(els.platformFilter) els.platformFilter.addEventListener('change', applyFiltersAndSort);
    if(els.sortSelect) els.sortSelect.addEventListener('change', applyFiltersAndSort);
    if(els.themeToggle) els.themeToggle.addEventListener('click', toggleTheme);
    if(els.gameGrid) els.gameGrid.addEventListener('click', handleGridClick);
}

// Debounce wrapper for input
const debouncedApplyFilters = debounce(applyFiltersAndSort, 500);

function handleSearchInput() {
    debouncedApplyFilters();
}

// Core Logic using Array Higher-Order Functions (filter, some, sort)
function applyFiltersAndSort() {
    if (!state.games || !state.games.length) return;
    
    const query = (els.searchInput.value || '').toLowerCase().trim();
    const platform = els.platformFilter ? els.platformFilter.value : 'all';
    const sortValue = els.sortSelect ? els.sortSelect.value : 'default';
    
    // 1. Requirement: Use Array.filter() for Searching and Filtering
    // Requirement is strictly NO traditional loops.
    state.displayedGames = state.games.filter(game => {
        // Search condition
        const matchesSearch = game.name.toLowerCase().includes(query);
        
        // Filter condition using Array.some()
        let matchesPlatform = true;
        if (platform !== 'all' && game.parent_platforms) {
            matchesPlatform = game.parent_platforms.some(p => {
                const slug = p.platform.slug.toLowerCase();
                if (platform === 'pc') return slug === 'pc';
                if (platform === 'playstation') return slug.includes('playstation');
                if (platform === 'xbox') return slug.includes('xbox');
                if (platform === 'nintendo') return slug.includes('nintendo') || slug === 'mac'; // RAWG uses slightly different slugs sometimes
                return false;
            });
        }
        
        return matchesSearch && matchesPlatform;
    });
    
    // 2. Requirement: Use Array.sort() for Sorting
    state.displayedGames.sort((a, b) => {
        if (sortValue === 'rating') {
            return (b.rating || 0) - (a.rating || 0);
        } else if (sortValue === 'release') {
            const dateA = a.released ? new Date(a.released) : new Date(0);
            const dateB = b.released ? new Date(b.released) : new Date(0);
            return dateB - dateA;
        } else if (sortValue === 'name') {
            return a.name.localeCompare(b.name);
        }
        return 0; // default order
    });
    
    renderGames();
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    els.themeToggle.innerHTML = isLight ? '<i class="ri-moon-line"></i>' : '<i class="ri-sun-line"></i>';
}

function handleGridClick(e) {
    const btn = e.target.closest('.favorite-btn');
    if (!btn) return;
    
    const gameId = btn.dataset.id;
    const index = state.favorites.indexOf(gameId);
    
    if (index > -1) {
        // Requirement: use array operations
        state.favorites.splice(index, 1);
        btn.classList.remove('active');
    } else {
        state.favorites.push(gameId);
        btn.classList.add('active');
    }
    saveFavorites();
}

// LocalStorage helpers for persistent wishlist
function saveFavorites() {
    try {
        localStorage.setItem('gameFavorites', JSON.stringify(state.favorites));
    } catch (e) {
        console.error("Could not save to localStorage", e);
    }
}

function loadFavorites() {
    try {
        const stored = localStorage.getItem('gameFavorites');
        if (stored) {
            state.favorites = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Could not load from localStorage", e);
    }
}

// Start app
init();
