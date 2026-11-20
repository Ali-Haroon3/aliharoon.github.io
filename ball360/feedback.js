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

function bestMatch(input, sport) {
  const typed = norm(input);
  const terms = answerTerms[sport];
  if (!typed || !terms) return null;
  if (terms.has(typed)) return terms.get(typed);
  if (typed.length < 3 || /\d/.test(typed)) return null;
  const words = typed.split(' ');
  const tolerance = typed.length >= 6 ? 2 : typed.length >= 4 ? 1 : 0;
  let best = null;
  let bestRank = Infinity;
  for (const [key, label] of terms) {
    const parts = key.split(' ');
    let rank = Infinity;
    if (words.every(word => parts.some(part => part.startsWith(word)))) rank = 1;
    else if (parts.some(part => part.includes(typed))) rank = 2;
    else if (key.startsWith(typed)) rank = 3.5;

    if (rank > 2 && bestRank > 2 && tolerance) {
      for (const [index, part] of [...parts, key].entries()) {
        if (part[0] !== typed[0] || Math.min(part.length, typed.length) < 3) continue;
        const edits = distance(typed, part.slice(0, typed.length));
        if (edits <= tolerance) rank = Math.min(rank, edits + (index === parts.length - 1 ? 2 : 3));
      }
    }
    if (rank < bestRank || (rank === bestRank && best && label.length < best.length)) {
      best = label;
      bestRank = rank;
    }
  }
  return best;
}

function currentMatch() {
  const item = questions[round];
  const typed = answerDraft.trim();
  // A valid custom alias or exact answer should always win over suggestions.
  return isCorrect(typed, item.a) ? typed : bestMatch(typed, item.sport);
}

function showBestMatch() {
  const match = currentMatch();
  const preview = document.getElementById('bestMatch');
  if (!preview) return;
  preview.textContent = match && norm(match) !== norm(answerDraft) ? 'Best match: ' + match : '';
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
  answerDraft = currentMatch() || answerDraft;
  submit(false);
};

const renderPlaytest = render;
render = () => {
  renderPlaytest();
  if (stage === 'question') {
    const input = document.getElementById('answer');
    if (document.getElementById('bestMatch')) return;
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'none');
    input.setAttribute('aria-describedby', 'bestMatch');
    input.spellcheck = false;
    input.insertAdjacentHTML('afterend', '<p id="bestMatch" class="best-match" aria-live="polite"></p>');
    input.addEventListener('input', showBestMatch);
    showBestMatch();
  } else if (stage === 'result') {
    const card = el.querySelector('.feedback-good, .feedback-bad');
    const result = history[round];
    if (result.answer && card && !card.querySelector('.arena-replay')) showArenaReplay(card, questions[round].sport, result);
  }
};
const initializePlaytest = initializeGame;
initializeGame = async () => {
  await initializePlaytest();
  initializeRules();
};
