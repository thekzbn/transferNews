// Global state
let transfersData = null;
let currentLeague = 'epl';
let statusFilter = 'all';
let typeFilter = 'all';

// Load transfers data and initialize app
async function init() {
    try {
        const response = await fetch('assets/json/transfers.json');
        transfersData = await response.json();
        
        renderLeagueButtons();
        renderTransfers();
        setupEventListeners();
        
        console.log('Transfer Window App initialized successfully');
    } catch (error) {
        console.error('Error loading transfers data:', error);
        showErrorMessage();
    }
}

// Show error message if data fails to load
function showErrorMessage() {
    const transfersGrid = document.getElementById('transfers-grid');
    const noResults = document.getElementById('no-results');
    
    transfersGrid.classList.add('hidden');
    noResults.classList.remove('hidden');
    
    noResults.innerHTML = `
        <div class="no-results-icon">
            <span class="material-symbols-outlined">error</span>
        </div>
        <div class="no-results-title">ERROR LOADING DATA</div>
        <div class="no-results-subtitle">PLEASE REFRESH THE PAGE</div>
    `;
}

// Render league selector buttons
function renderLeagueButtons() {
    const leagueButtonsContainer = document.getElementById('league-buttons');
    
    transfersData.leagues.forEach(league => {
        const button = document.createElement('button');
        button.className = `league-btn ${league.id === currentLeague ? 'active' : ''}`;
        button.dataset.league = league.id;
        
        button.innerHTML = `
            <div class="league-btn-name">${league.shortName}</div>
            <div class="league-btn-country">${league.country}</div>
        `;
        
        leagueButtonsContainer.appendChild(button);
    });
}

// Get filtered transfers
function getFilteredTransfers() {
    const allTransfers = transfersData.transfers[currentLeague] || [];
    
    return allTransfers.filter(transfer => {
        const statusMatch = statusFilter === 'all' || transfer.status === statusFilter;
        const typeMatch = typeFilter === 'all' || transfer.type === typeFilter;
        return statusMatch && typeMatch;
    });
}

// Get status badge HTML with icon
function getStatusBadgeHtml(status) {
    const statusConfig = {
        completed: { class: 'badge-completed', icon: 'check_circle', text: 'COMPLETED' },
        pending: { class: 'badge-pending', icon: 'schedule', text: 'PENDING' },
        rumored: { class: 'badge-rumored', icon: 'help', text: 'RUMORED' }
    };
    
    const config = statusConfig[status] || { class: 'badge-completed', icon: 'info', text: status.toUpperCase() };
    
    return `
        <div class="badge ${config.class}">
            <span class="material-symbols-outlined">${config.icon}</span>
            ${config.text}
        </div>
    `;
}

// Get type badge HTML with icon
function getTypeBadgeHtml(type) {
    const typeConfig = {
        permanent: { class: 'badge-permanent', icon: 'home', text: 'PERMANENT' },
        loan: { class: 'badge-loan', icon: 'swap_horiz', text: 'LOAN' }
    };
    
    const config = typeConfig[type] || { class: 'badge-permanent', icon: 'info', text: type.toUpperCase() };
    
    return `
        <div class="badge ${config.class}">
            <span class="material-symbols-outlined">${config.icon}</span>
            ${config.text}
        </div>
    `;
}

// Create transfer card HTML
function createTransferCard(transfer) {    
    return `
        <div class="transfer-card">
            <div class="transfer-header">
                <div class="player-info">
                    <h3 class="player-name">${transfer.playerName}</h3>
                    <p class="player-details">
                        ${transfer.position} • ${transfer.age}Y • ${transfer.nationality}
                    </p>
                </div>
                <div class="transfer-badges">
                    ${getStatusBadgeHtml(transfer.status)}
                    ${getTypeBadgeHtml(transfer.type)}
                </div>
            </div>
            
            <div class="transfer-movement">
                <div class="team-section">
                    <div class="team-label" data-icon="sports_soccer">FROM</div>
                    <div class="team-name">${transfer.fromTeam}</div>
                </div>
                
                <div class="transfer-arrow">
                    <span class="material-symbols-outlined">arrow_forward</span>
                </div>
                
                <div class="team-section">
                    <div class="team-label" data-icon="sports_soccer">TO</div>
                    <div class="team-name">${transfer.toTeam}</div>
                </div>
            </div>
            
            <div class="transfer-footer">
                <div class="fee-info">
                    <div class="fee-label">
                        <span class="material-symbols-outlined">payments</span>
                        FEE
                    </div>
                    <div class="fee-amount">${transfer.fee}</div>
                </div>
                <div class="transfer-date">
                    <div class="date-text">
                        <span class="material-symbols-outlined">calendar_today</span>
                        ${transfer.date}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render transfers
function renderTransfers() {
    const filteredTransfers = getFilteredTransfers();
    const transfersGrid = document.getElementById('transfers-grid');
    const noResults = document.getElementById('no-results');
    const countText = document.getElementById('count-text');
    const currentLeagueName = document.getElementById('current-league-name');
    
    // Update count and league name
    countText.innerHTML = `
        <span class="material-symbols-outlined">analytics</span>
        SHOWING ${filteredTransfers.length} TRANSFERS
    `;
    
    const league = transfersData.leagues.find(l => l.id === currentLeague);
    currentLeagueName.textContent = league ? league.name.toUpperCase() : '';
    
    // Show/hide transfers grid and no results message
    if (filteredTransfers.length === 0) {
        transfersGrid.classList.add('hidden');
        noResults.classList.remove('hidden');
        
        // Reset no results content
        noResults.innerHTML = `
            <div class="no-results-icon">
                <span class="material-symbols-outlined">search_off</span>
            </div>
            <div class="no-results-title">NO TRANSFERS FOUND</div>
            <div class="no-results-subtitle">TRY ADJUSTING YOUR FILTERS</div>
        `;
    } else {
        transfersGrid.classList.remove('hidden');
        noResults.classList.add('hidden');
        
        // Render transfer cards with animation
        transfersGrid.innerHTML = '';
        
        filteredTransfers.forEach((transfer, index) => {
            const cardElement = document.createElement('div');
            cardElement.innerHTML = createTransferCard(transfer);
            cardElement.style.animationDelay = `${index * 100}ms`;
            cardElement.classList.add('transfer-card-animate');
            transfersGrid.appendChild(cardElement.firstElementChild);
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // League selector buttons
    document.getElementById('league-buttons').addEventListener('click', (e) => {
        const button = e.target.closest('.league-btn');
        if (!button) return;
        
        // Update active state
        document.querySelectorAll('.league-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Update current league and re-render
        currentLeague = button.dataset.league;
        renderTransfers();
        
        // Add click animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    });
    
    // Status filter buttons
    document.getElementById('status-filters').addEventListener('click', (e) => {
        const button = e.target.closest('.filter-btn');
        if (!button) return;
        
        // Update active state
        document.querySelectorAll('#status-filters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Update filter and re-render
        statusFilter = button.dataset.filter;
        renderTransfers();
        
        // Add click animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    });
    
    // Type filter buttons
    document.getElementById('type-filters').addEventListener('click', (e) => {
        const button = e.target.closest('.filter-btn');
        if (!button) return;
        
        // Update active state
        document.querySelectorAll('#type-filters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Update filter and re-render
        typeFilter = button.dataset.filter;
        renderTransfers();
        
        // Add click animation
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key >= '1' && e.key <= '7') {
            const leagueIndex = parseInt(e.key) - 1;
            const leagues = document.querySelectorAll('.league-btn');
            if (leagues[leagueIndex]) {
                leagues[leagueIndex].click();
            }
        }
    });
}

// Add some helper functions for enhanced functionality
function updatePageTitle() {
    const league = transfersData.leagues.find(l => l.id === currentLeague);
    const leagueName = league ? league.name : 'Transfer Window';
    document.title = `${leagueName} - TRANSFER WINDOW`;
}

// Enhanced rendering with title updates
function renderTransfersEnhanced() {
    renderTransfers();
    updatePageTitle();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add some performance monitoring
window.addEventListener('load', () => {
    console.log('Transfer Window App fully loaded');
});

// Handle offline/online status
window.addEventListener('online', () => {
    console.log('Connection restored');
});

window.addEventListener('offline', () => {
    console.log('Connection lost - using cached data');
});