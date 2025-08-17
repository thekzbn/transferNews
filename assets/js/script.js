let transfersData = null;
let currentLeague = 'epl';
let statusFilter = 'all';
let typeFilter = 'all';
let currentView = 'timeline'; // default

async function init() {
  try {
    const response = await fetch('assets/json/transfers.json');
    transfersData = await response.json();
    renderLeagueButtons();
    renderTransfers();
    setupEventListeners();
  } catch (err) {
    console.error("Error loading JSON:", err);
  }
}

function renderLeagueButtons() {
  const container = document.getElementById('league-buttons');
  transfersData.leagues.forEach(league => {
    const btn = document.createElement('button');
    btn.className = `league-btn ${league.id===currentLeague?'active':''}`;
    btn.dataset.league = league.id;
    btn.innerHTML = `<div>${league.shortName}</div><div>${league.country}</div>`;
    container.appendChild(btn);
  });
}

function getFilteredTransfers() {
  const all = transfersData.transfers[currentLeague] || [];
  return all.filter(t => 
    (statusFilter==='all'||t.status===statusFilter) &&
    (typeFilter==='all'||t.type===typeFilter)
  );
}

function createTimelineCard(t) {
  return `
    <div class="transfer-card ${t.status}">
      <div class="player-name">${t.playerName}</div>
      <div class="player-details">${t.position} • ${t.age}Y • ${t.nationality}</div>
      <div class="transfer-movement">
        <div>${t.fromTeam}</div>
        <span class="material-symbols-outlined">arrow_forward</span>
        <div>${t.toTeam}</div>
      </div>
      <div class="transfer-footer">
        <div>Fee: ${t.fee}</div>
        <div>${t.date}</div>
      </div>
    </div>
  `;
}

function createScoreboardTable(transfers) {
  let rows = transfers.map(t => `
    <tr>
      <td>${t.playerName}</td>
      <td>${t.fromTeam}</td>
      <td>${t.toTeam}</td>
      <td>${t.fee}</td>
      <td>${t.status.toUpperCase()}</td>
      <td>${t.type.toUpperCase()}</td>
      <td>${t.date}</td>
    </tr>
  `).join("");
  return `
    <div class="scoreboard">
      <table>
        <thead>
          <tr><th>Player</th><th>From</th><th>To</th><th>Fee</th><th>Status</th><th>Type</th><th>Date</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderTransfers() {
  const grid = document.getElementById('transfers-grid');
  const noResults = document.getElementById('no-results');
  const transfers = getFilteredTransfers();

  document.getElementById('count-text').innerHTML =
    `<span class="material-symbols-outlined">analytics</span> SHOWING ${transfers.length} TRANSFERS`;
  const league = transfersData.leagues.find(l=>l.id===currentLeague);
  document.getElementById('current-league-name').textContent = league? league.name : '';

  if (transfers.length===0) {
    grid.innerHTML=""; grid.className="transfers-grid"; 
    noResults.classList.remove("hidden");
    return;
  }
  noResults.classList.add("hidden");

  if (currentView==='timeline') {
    grid.className = "transfers-grid timeline";
    grid.innerHTML = transfers.map(createTimelineCard).join("");
  } else {
    grid.className = "transfers-grid scoreboard";
    grid.innerHTML = createScoreboardTable(transfers);
  }
}

function setupEventListeners() {
  document.getElementById('league-buttons').addEventListener('click', e=>{
    const btn = e.target.closest('.league-btn'); if(!btn) return;
    document.querySelectorAll('.league-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); currentLeague = btn.dataset.league;
    renderTransfers();
  });
  document.getElementById('status-filters').addEventListener('click', e=>{
    const btn = e.target.closest('.filter-btn'); if(!btn) return;
    document.querySelectorAll('#status-filters .filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); statusFilter = btn.dataset.filter;
    renderTransfers();
  });
  document.getElementById('type-filters').addEventListener('click', e=>{
    const btn = e.target.closest('.filter-btn'); if(!btn) return;
    document.querySelectorAll('#type-filters .filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); typeFilter = btn.dataset.filter;
    renderTransfers();
  });
  document.querySelector('.view-toggle').addEventListener('click', e=>{
    const btn = e.target.closest('.toggle-btn'); if(!btn) return;
    document.querySelectorAll('.view-toggle .toggle-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); currentView = btn.dataset.view;
    renderTransfers();
  });
}

document.addEventListener('DOMContentLoaded', init);
