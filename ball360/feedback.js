'use strict';

// All matches come from the bank for the current sport, independent of the prompt.
const answerTerms = {NBA: new Map(), NFL: new Map()};
for (const item of Object.values(QUESTION_BY_ID)) {
  const dictionary = answerTerms[item.sport];
  const labels = new Map(item.a.map(label => [norm(label), label]));
  for (const alias of expandAcceptedAnswers(item.a)) {
    if (alias) dictionary.set(alias, labels.get(alias) ||
      dictionary.get(alias) || alias.replace(/\b[a-z]/g, letter => letter.toUpperCase()));
  }
}

function answerMatches(input, sport) {
  const typed = norm(input);
  const terms = answerTerms[sport];
  if (!typed || !terms) return [];
  if (typed.length < 3 || /\d/.test(typed)) return terms.has(typed) ? [terms.get(typed)] : [];
  const words = typed.split(' ');
  const tolerance = typed.length >= 6 ? 2 : typed.length >= 4 ? 1 : 0;
  const matches = [];
  for (const [key, label] of terms) {
    const parts = key.split(' ');
    let rank = Infinity;
    if (key === typed) rank = 0;
    else if (words.every(word => parts.some(part => part.startsWith(word)))) rank = 1;
    else if (parts.some(part => part.includes(typed))) rank = 2;
    else if (key.startsWith(typed)) rank = 3.5;
    else if (tolerance) {
      const candidates = [...parts, key];
      for (const [index, part] of candidates.entries()) {
        if (part[0] !== typed[0] || Math.min(part.length, typed.length) < 3) continue;
        const edits = distance(typed, part.slice(0, typed.length));
        if (edits <= tolerance) rank = Math.min(rank, edits + (index === parts.length - 1 ? 2 : 3));
      }
    }
    if (Number.isFinite(rank)) matches.push({label, rank});
  }
  return matches.sort((a,b) => a.rank - b.rank || a.label.length - b.label.length || a.label.localeCompare(b.label))
    .slice(0, 6).map(match => match.label);
}

let choices = [];
let activeChoice = -1;
let lastQuery;
let useTyped = false;
let navigatedChoices = false;

function updateAnswerOptions(input, list) {
  if (lastQuery !== input.value) {
    choices = answerMatches(input.value, questions[round].sport);
    activeChoice = choices.length ? 0 : -1;
    lastQuery = input.value;
  }
  list.hidden = !choices.length || useTyped;
  input.setAttribute('aria-expanded', String(!list.hidden));
  list.replaceChildren();
  if (!list.hidden) choices.forEach((label, i) => {
    const option = document.createElement('li');
    option.id = 'answerOption' + i;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', String(i === activeChoice));
    option.textContent = label;
    option.addEventListener('pointerdown', event => event.preventDefault());
    option.addEventListener('click', () => {
      input.value = label;
      answerDraft = label;
      useTyped = true;
      updateAnswerOptions(input, list);
      saveAttempt();
      input.focus();
    });
    list.append(option);
  });
  if (list.hidden || activeChoice < 0) input.removeAttribute('aria-activedescendant');
  else input.setAttribute('aria-activedescendant', 'answerOption' + activeChoice);
}

function attachAnswerOptions(input) {
  const list = document.createElement('ul');
  list.id = 'answerOptions';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Answer matches');
  list.className = 'answer-options';
  input.after(list);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', list.id);
  input.setAttribute('autocorrect', 'off');
  input.spellcheck = false;
  lastQuery = undefined;
  useTyped = false;
  navigatedChoices = false;
  const update = () => updateAnswerOptions(input, list);
  input.addEventListener('input', () => {useTyped = false; navigatedChoices = false; update();});
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !list.hidden) {
      event.preventDefault();
      useTyped = true;
      update();
    } else if (['ArrowDown','ArrowUp'].includes(event.key) && choices.length) {
      event.preventDefault();
      useTyped = false;
      navigatedChoices = true;
      activeChoice = (activeChoice + choices.length + (event.key === 'ArrowDown' ? 1 : -1)) % choices.length;
      update();
    }
  });
  update();
}

function openRules() {
  const dialog = document.getElementById('rulesDialog');
  if (dialog.open) return;
  const rules = document.getElementById('rules-list');
  document.getElementById('rules-preview').replaceChildren(rules.cloneNode(true));
  document.getElementById('rules-preview').firstElementChild.removeAttribute('id');
  dialog.showModal();
}

function initializeRules() {
  const seen = 'ball360_rules_seen';
  const dialog = document.getElementById('rulesDialog');
  dialog.addEventListener('close', () => localStorage.setItem(seen, 'yes'));
  if (!localStorage.getItem(seen)) openRules();
}

// Extend the static playtest already deployed on GitHub Pages.
isCorrect = (input, aliases) => {
  const normalized = norm(input);
  return Boolean(normalized && expandAcceptedAnswers(aliases).includes(normalized));
};
handleAnswerSubmit = event => {
  event.preventDefault();
  if (Date.now() >= questionDeadline) { submit(true); return; }
  if (!answerDraft.trim()) return;
  const typed = answerDraft.trim();
  const selected = choices[activeChoice];
  const explicitlySelected = navigatedChoices;
  if (!useTyped && selected && (explicitlySelected || !isCorrect(typed, questions[round].a))) answerDraft = selected;
  submit(false);
};

const renderPlaytest = render;
render = () => {
  renderPlaytest();
  if (stage === 'question') {
    const input = document.getElementById('answer');
    if (!document.getElementById('answerOptions')) attachAnswerOptions(input);
  } else if (stage === 'finished') {
    const summary = el.querySelector('.final-card');
    if (summary && !summary.querySelector('.score-chart')) summary.insertAdjacentHTML('beforeend', roundProgressChart(history));
  } else if (stage === 'result') {
    const card = el.querySelector('.feedback-good, .feedback-bad');
    const result = history[round];
    if (result.answer && card && !card.querySelector('.arena-replay')) showArenaReplay(card, questions[round].sport, result, score);
  }
};
const initializePlaytest = initializeGame;
initializeGame = async () => {
  await initializePlaytest();
  initializeRules();
};

function scoreColumns(title, columns, maximum) {
  return '<figure class="score-chart"><figcaption>' + title + '</figcaption><ol>' +
    columns.map(({label, value, highlighted}) =>
      '<li' + (highlighted ? ' class="your-score-band"' : '') + '><strong>' + value + '</strong>' +
      '<span class="score-column" style="--fill:' + (value / maximum * 100) + '%"></span>' +
      '<small>' + label + (highlighted ? '<span class="band-you">You</span>' : '') + '</small></li>'
    ).join('') + '</ol></figure>';
}

function roundProgressChart(rounds) {
  let total = 0;
  const columns = rounds.map((result, i) => ({label:'R' + (i + 1), value:total += result.earned}));
  return scoreColumns('Your score by round', columns, 360);
}

resultsExtras = () => {
  const title = '<h3>Daily score distribution</h3>';
  if (!config.sharedScores) return title + '<p class="note">Shared scores aren’t connected in this preview.</p>';
  if (globalStatus !== 'ready' || !globalStats) {
    const status = globalStatus === 'loading' ? 'Loading today’s scores…' : 'Shared scores are temporarily unavailable.';
    return title + '<p class="note">' + status + '</p>' + refreshControl();
  }
  const bands = ['0–59','60–119','120–179','180–239','240–299','300–360'];
  const columns = bands.map((label, i) => ({
    label,
    value:Math.max(0, Number(globalStats.bands?.[i]) || 0),
    highlighted:i === Math.min(5, Math.floor(score / 60))
  }));
  const count = columns.reduce((sum, band) => sum + band.value, 0);
  if (!count) return title + '<p class="note">No shared scores yet today.</p>' + refreshControl();
  const below = Number(globalStats.below) || 0;
  const average = Math.round(Number(globalStats.average) || 0);
  const overview = '<p class="note">' + count + ' completed ' + (count === 1 ? 'game' : 'games') +
    ' · Average: ' + average + ' points · ' + below + ' below your score</p>';
  return scoreColumns('Daily score distribution', columns, Math.max(1, ...columns.map(band => band.value))) +
    overview + refreshControl();
};
