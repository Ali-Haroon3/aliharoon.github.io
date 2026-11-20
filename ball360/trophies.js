const TROPHIES = [
  {id:'ticket', name:'Game Ticket', icon:'🎟️', rarity:'Common'},
  {id:'whistle', name:'Ref’s Whistle', icon:'◈', rarity:'Common'},
  {id:'ball', name:'Signed Game Ball', icon:'🏀', rarity:'Rare'},
  {id:'helmet', name:'Game-Worn Helmet', icon:'🏈', rarity:'Rare'},
  {id:'ring', name:'Championship Ring', icon:'💍', rarity:'Epic'},
  {id:'cup', name:'The 360 Cup', icon:'🏆', rarity:'Legendary'},
];
const RARITIES = [['Common', 65], ['Rare', 25], ['Epic', 8], ['Legendary', 2]];
const SPIN_KEY = 'ball360_trophy_spins_v1';
let spinning = false;

function openRecords() {
  refreshRecords();
  document.getElementById('recordsDialog').showModal();
}
function nextUnclaimedDay(claims) {
  return Object.keys(savedCompletions()).sort().find(day => !Object.hasOwn(claims, day));
}
function updateTrophyNav() {
  document.getElementById('rewardDot').hidden = !nextUnclaimedDay(readLocal(SPIN_KEY, {}));
}
function openTrophies() {
  renderTrophies();
  document.getElementById('trophyDialog').showModal();
}
function renderTrophies(reward) {
  const claims = readLocal(SPIN_KEY, {});
  const available = Boolean(nextUnclaimedDay(claims));
  const collected = Object.values(claims);
  document.getElementById('trophyContent').innerHTML =
    '<h2 id="trophyTitle">Trophy Room</h2><div class="spin-face" aria-hidden="true">' + (reward?.icon || '✦') +
    '</div><p class="note" role="status">' + (reward ? reward.name + ' · ' + reward.rarity :
      available ? 'You earned a spin.' : 'Finish a daily challenge to earn a spin.') +
    '</p><button id="spinButton" class="button" type="button" onclick="spinTrophy()" ' + (!available || spinning ? 'disabled' : '') +
    '>Spin for a trophy</button><p class="note">Common 65% · Rare 25% · Epic 8% · Legendary 2%</p>' +
    '<h3>Collection</h3><ul class="trophy-list">' + TROPHIES.map(item => {
      const count = collected.filter(id => id === item.id).length;
      return '<li><span aria-hidden="true">' + (count ? item.icon : '—') + '</span><span>' +
        (count ? item.name + (count > 1 ? ' ×' + count : '') : 'Undiscovered') +
        '</span><span class="rarity" data-rarity="' + item.rarity + '">' + item.rarity + '</span></li>';
    }).join('') + '</ul>';
}
function claimSpin() {
  const claims = readLocal(SPIN_KEY, {});
  const day = nextUnclaimedDay(claims);
  if (!day) return null;
  let roll = Math.random() * 100;
  const [rarity] = RARITIES.find(([, weight]) => (roll -= weight) < 0);
  const pool = TROPHIES.filter(item => item.rarity === rarity);
  const reward = pool[Math.floor(Math.random() * pool.length)];
  claims[day] = reward.id;
  localStorage.setItem(SPIN_KEY, JSON.stringify(claims));
  return reward;
}
async function spinTrophy() {
  if (spinning) return;
  spinning = true;
  document.getElementById('spinButton').disabled = true;
  let reward;
  try {
    reward = navigator.locks ? await navigator.locks.request(SPIN_KEY, claimSpin) : claimSpin();
  } catch (error) {
    spinning = false;
    renderTrophies();
    document.querySelector('#trophyContent [role="status"]').textContent = 'Could not save your trophy. Try again.';
    return;
  }
  spinning = false;
  updateTrophyNav();
  renderTrophies(reward);
  if (reward) document.querySelector('.spin-face').classList.add('spinning');
}
window.addEventListener('storage', event => {
  if (event.key === SPIN_KEY || event.key === 'ball360_completed_days') {
    updateTrophyNav();
    if (document.getElementById('trophyDialog').open && !spinning) renderTrophies();
  }
});
initializeGame();
