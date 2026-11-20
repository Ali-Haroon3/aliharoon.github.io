'use strict';

// The dictionary is built from the whole bank. A suggestion has no knowledge of
// which answer is correct for the current question.
const spellingDictionary = new Map();
function addSpelling(label) {
  const key = norm(label);
  if (key.length >= 5 && !/\d/.test(key) && !spellingDictionary.has(key)) {
    spellingDictionary.set(key, label);
  }
}
for (const item of Object.values(QUESTION_BY_ID)) {
  item.a.forEach(addSpelling);
  expandAcceptedAnswers(item.a).forEach(alias =>
    addSpelling(alias.replace(/\b[a-z]/g, letter => letter.toUpperCase())));
}

function spellingSuggestion(input) {
  const typed = norm(input);
  if (typed.length < 5 || /\d/.test(typed) || spellingDictionary.has(typed)) return null;
  let bestDistance = typed.length >= 9 ? 2 : 1;
  let bestLabel = null;
  let tied = false;
  for (const [candidate, label] of spellingDictionary) {
    if (Math.abs(typed.length - candidate.length) > bestDistance) continue;
    const difference = distance(typed, candidate);
    if (difference > bestDistance) continue;
    if (difference === bestDistance && bestLabel !== null) {
      tied = true;
      continue;
    }
    bestDistance = difference;
    bestLabel = label;
    tied = false;
  }
  return tied ? null : bestLabel;
}

function hideSpelling() {
  const review = document.getElementById('spellingReview');
  if (review) review.hidden = true;
}
function shotMarkup(sport, result) {
  if (!result.answer) return '';
  const goal = sport === 'NFL' ? 'uprights' : 'basket';
  const outcome = result.correct ? 'made' : 'missed';
  return '<div aria-hidden="true" class="shot ' + goal + ' ' + outcome + '"><span class="shot-line"></span>' +
    '<span class="shot-target"></span><span class="shot-ball"></span></div>';
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
  const suggestion = isCorrect(answerDraft, questions[round].a) ? null : spellingSuggestion(answerDraft);
  if (!suggestion) { submit(false); return; }
  const review = document.getElementById('spellingReview');
  review.hidden = false;
  review.querySelector('strong').textContent = suggestion;
  const accept = document.getElementById('useSpelling');
  accept.onclick = () => {
    if (Date.now() < questionDeadline) answerDraft = suggestion;
    submit(Date.now() >= questionDeadline);
  };
  accept.focus();
};
const renderPlaytest = render;
render = () => {
  renderPlaytest();
  if (stage === 'question') {
    const input = document.getElementById('answer');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'none');
    input.spellcheck = false;
    input.addEventListener('input', hideSpelling);
    document.getElementById('answerform').insertAdjacentHTML('afterend',
      '<section class="spelling-review" id="spellingReview" hidden aria-label="Spelling suggestion">' +
      '<p>Did you mean <strong></strong>?</p><div class="spelling-actions">' +
      '<button type="button" class="button" id="useSpelling">Use suggestion</button>' +
      '<button type="button" class="button mode-secondary" id="keepSpelling">Submit as typed</button>' +
      '<button type="button" class="nav-button" id="editSpelling">Edit answer</button></div></section>');
    document.getElementById('keepSpelling').onclick = () => submit(Date.now() >= questionDeadline);
    document.getElementById('editSpelling').onclick = () => {hideSpelling(); input.focus();};
  } else if (stage === 'result') {
    const card = el.querySelector('.feedback-good, .feedback-bad');
    if (card && !card.querySelector('.shot')) {
      card.insertAdjacentHTML('afterbegin', shotMarkup(questions[round].sport, history[round]));
    }
  }
};
const initializePlaytest = initializeGame;
initializeGame = async () => {
  await initializePlaytest();
  initializeRules();
};
