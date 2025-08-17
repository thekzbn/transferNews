let transfersData = null;
let currentLeague = 'epl';
let statusFilter = 'all';
let typeFilter = 'all';
let currentView = 'timeline'; // default view

async function init() {
  try {
    const response = await fetch('assets/json/transfers.json');
    transfersData = await response.json();
    renderLeagueButtons();
    renderTransfers();
    setupEventListeners();
  } catch (err) {
    console.error('Error loading transfers:', err);
    showErrorMessage();
  }
}

function showErrorMessage() {
  const grid = document.getElementById('transfers-grid');
  const noResults = document.getElementById('no-results');
  grid.innerHTML = "";
  noResults.classList.remove("hidden");
  noResults.innerHTML = `
    <div class="no-results-icon"><span class="material-symbols-outlined">error</span></div>
    <div class="no-results-title">ERROR LOADING DATA</div>
    <div class="no-results-subtitle">PLEASE REFRESH</div>
  `;
}

function renderLeagueButtons() {
  const container = document.getElementById('league-buttons');
  container.innerHTML = '';
  transfersData.leagues.forEach(l => {
    const btn = document.createElement('button');
    btn.className = `league-btn ${l.id === currentLeague ? 'active' : ''}`;
    btn.dataset.league = l.id;
    btn.innerHTML = `<div class="league-btn-name">${l.shortName}</div>
                     <div class="league-btn-country">${l.country}</div>`;
    container.appendChild(btn);
  });
}

function getFilteredTransfers() {
  const all = transfersData.transfers[currentLeague] || [];
  return all.filter(t => {
    const statusMatch = statusFilter === 'all' || t.status === statusFilter;
    const typeMatch = typeFilter === 'all' || t.type === typeFilter;
    return statusMatch && typeMatch;
  });
}

function createTransferCard(t) {
  return `
    <div class="transfer-card ${t.status}">
      <h3 class="player-name">${t.playerName}</h3>
      <p class="player-details">${t.position} • ${t.age}Y • ${t.nationality}</p>
      <div class="transfer-movement">
        <div>From: ${t.fromTeam}</div>
        <span class="material-symbols-outlined">arrow_forward</span>
        <div>To: ${t.toTeam}</div>
      </div>
      <div class="transfer-footer">
        <div>Fee: ${t.fee}</div>
        <div>${t.date}</div>
      </div>
    </div>`;
}

function renderTransfers() {
  const grid = document.getElementById('transfers-grid');
  const noResults = document.getElementById('no-results');
  const transfers = getFilteredTransfers();

  // update count + league name
  document.getElementById('count-text').innerHTML =
    `<span class="material-symbols-outlined">analytics</span> SHOWING ${transfers.length} TRANSFERS`;
  const league = transfersData.leagues.find(l => l.id === currentLeague);
  document.getElementById('current-league-name').textContent = league ? league.name.toUpperCase() : '';

  if (!transfers.length) {
    grid.innerHTML = "";
    noResults.classList.remove("hidden");
    return;
  }
  noResults.classList.add("hidden");

  if (currentView === 'timeline') {
    grid.className = "transfers-grid timeline";
    grid.innerHTML = transfers.map(t => `
      <div class="transfer-item">
        <div class="status-dot ${t.status}"></div>
        <div class="transfer-content">
          <div class="player-line">${t.playerName} → ${t.toTeam}</div>
          <div class="details-line">${t.position} • ${t.age}Y • ${t.nationality} • Fee: ${t.fee}</div>
          <div class="meta-line">From ${t.fromTeam} • ${t.date}</div>
        </div>
      </div>
    `).join("");
  } else {
    grid.className = "transfers-grid scoreboard";
    grid.innerHTML = transfers.map(createTransferCard).join("");
  }
}

function setupEventListeners() {
  // league
  document.getElementById('league-buttons').addEventListener('click', e => {
    const btn = e.target.closest('.league-btn');
    if (!btn) return;
    document.querySelectorAll('.league-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLeague = btn.dataset.league;
    renderTransfers();
  });

  // filters
  document.getElementById('status-filters').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('#status-filters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    statusFilter = btn.dataset.filter;
    renderTransfers();
  });

  document.getElementById('type-filters').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('#type-filters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    typeFilter = btn.dataset.filter;
    renderTransfers();
  });

  // view toggle
  document.querySelector('.view-toggle').addEventListener('click', e => {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    renderTransfers();
  });
}

document.addEventListener('DOMContentLoaded', init);
