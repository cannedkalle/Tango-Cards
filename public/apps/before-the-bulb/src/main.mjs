import { buildWildComparisonPairs, createGame, validateContent } from './game.mjs';

const $ = id => document.getElementById(id);
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function boot() {
  try {
    const [baseObjects, basePairs, baseSources, expansion] = await Promise.all(['objects', 'pairs', 'sources', 'expansion'].map(async name => {
      const response = await fetch(new URL(`../data/${name}.json`, import.meta.url));
      if (!response.ok) throw new Error(`Could not load ${name}`);
      return response.json();
    }));
    const objects = [...baseObjects, ...expansion.objects];
    const pairs = [...basePairs, ...expansion.pairs];
    const sources = [...baseSources, ...expansion.sources];
    const { objectMap, sourceMap } = validateContent({ objects, pairs, sources });
    const wildPairs = buildWildComparisonPairs(objects);
    const modes = {
      curated: {
        pairs
      },
      wild: {
        pairs: wildPairs
      }
    };
    let mode = 'curated';
    let game = createGame(modes[mode].pairs);
    $('loading').hidden = true;
    $('restart').hidden = false;
    updateModeUI();

    function updateModeUI() {
      for (const button of document.querySelectorAll('[data-mode]')) {
        const selected = button.dataset.mode === mode;
        button.setAttribute('aria-pressed', String(selected));
      }
    }

    function switchMode(nextMode) {
      if (nextMode === mode) return;
      mode = nextMode;
      game = createGame(modes[mode].pairs);
      updateModeUI();
      showQuestion(game.next(), true);
    }

    function updateScore(state) {
      $('score').replaceChildren(document.createTextNode(`${state.correct} `), element('span', '', `/ ${state.answered} correct`));
      $('score').setAttribute('aria-label', `${state.correct} correct out of ${state.answered} answered`);
    }

    function showQuestion(state, focus = false) {
      $('reveal').hidden = true;
      $('source-details').open = false;
      $('reassurance').hidden = false;
      $('announcement').textContent = '';
      $('instruction').textContent = state.cycle > 1 && state.position === 1
        ? `You explored every question in this set! Let’s try a fresh shuffle.`
        : 'Two bright ideas. Tap the one that came earlier.';
      updateScore(state);
      $('choices').replaceChildren(...state.choices.map((id, index) => {
        const object = objectMap.get(id);
        const card = element('article', 'choice-card');
        card.dataset.objectId = id;
        const pick = element('button', 'pick');
        pick.type = 'button';
        pick.setAttribute('aria-label', `Choose ${object.name}`);
        const letter = element('span', 'choice-letter', index === 0 ? 'A' : 'B');
        letter.setAttribute('aria-hidden', 'true');
        const art = element('span', 'object-art', object.icon);
        art.setAttribute('aria-hidden', 'true');
        pick.append(letter, art, element('strong', 'object-name', object.name), element('span', 'choice-status', 'Tap to choose'));
        pick.addEventListener('click', () => {
          const result = game.answer(id);
          if (result) showAnswer(result);
        });
        const toggle = element('button', 'definition-toggle', 'What’s this?');
        toggle.type = 'button';
        toggle.setAttribute('aria-label', `What's this: ${object.name}?`);
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', `definition-${id}`);
        const definition = element('p', 'definition', object.kidDefinition);
        definition.id = `definition-${id}`;
        definition.hidden = true;
        toggle.addEventListener('click', () => {
          definition.hidden = !definition.hidden;
          toggle.setAttribute('aria-expanded', String(!definition.hidden));
          toggle.textContent = definition.hidden ? 'What’s this?' : 'Got it! Close definition';
        });
        card.append(pick, toggle, definition);
        return card;
      }));
      if (focus) $('question').focus({ preventScroll: true });
    }

    function showAnswer(state) {
      const pair = state.pair;
      const earlier = objectMap.get(pair.earlierObjectId);
      const later = objectMap.get(state.choices.find(id => id !== earlier.id));
      const isCorrect = state.selected === earlier.id;
      updateScore(state);
      for (const card of $('choices').children) {
        const isEarlier = card.dataset.objectId === earlier.id;
        const isChosen = card.dataset.objectId === state.selected;
        card.classList.toggle('is-earlier', isEarlier);
        card.classList.toggle('is-chosen', isChosen);
        card.querySelector('.pick').disabled = true;
        card.querySelector('.choice-status').textContent = isEarlier ? (isChosen ? '✓ You got it! Came first' : '✓ This one came first') : (isChosen ? 'Your guess · came later' : 'Came later');
        card.querySelector('.definition').hidden = true;
        const toggle = card.querySelector('.definition-toggle');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'What’s this?';
      }
      $('feedback').textContent = isCorrect ? 'YOU’VE GOT A BRIGHT MIND!' : 'A LITTLE SURPRISE!';
      $('result-title').textContent = `${earlier.name} came first!`;
      $('dates').replaceChildren(...state.choices.map(id => {
        const object = objectMap.get(id);
        const isEarlier = object.id === earlier.id;
        const block = element('div', `date ${isEarlier ? 'is-earlier' : 'is-later'}`);
        block.append(element('span', 'label', isEarlier ? 'Came first' : 'Came later'), element('strong', '', object.dateDisplay), element('h3', '', object.name), element('p', '', object.dateBasis));
        return block;
      }));
      $('fact-heading').textContent = pair.funFact ? 'A bright little fact' : 'A wild little thought';
      $('fact').textContent = pair.funFact || 'A wild time-travel matchup! Check the dates to see how far apart these ideas are.';
      const sourceNodes = [earlier, later].map(object => {
        const item = element('div', 'source-item');
        item.append(element('strong', '', `${object.name}: ${object.dateDisplay}`), element('p', '', object.ambiguityNotes));
        for (const id of object.dateSourceIds) item.append(sourceLink(sourceMap.get(id)));
        return item;
      });
      if (pair.factSourceIds?.length) {
        const factSources = element('div', 'source-item');
        factSources.append(element('strong', '', 'Fun fact source'));
        for (const id of pair.factSourceIds) factSources.append(sourceLink(sourceMap.get(id)));
        sourceNodes.push(factSources);
      }
      $('sources').replaceChildren(...sourceNodes);
      $('reveal').hidden = false;
      $('reassurance').hidden = true;
      $('announcement').textContent = `${isCorrect ? 'Correct!' : 'Good guess!'} ${earlier.name} came first. ${earlier.dateDisplay}; ${later.name}, ${later.dateDisplay}. ${pair.funFact}`;
      $('next').focus({ preventScroll: true });
      $('reveal').scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }

    function sourceLink(source) {
      const paragraph = element('p');
      const link = element('a', '', `${source.publisher} · ${source.title} ↗`);
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      paragraph.append(link);
      return paragraph;
    }

    $('next').addEventListener('click', () => showQuestion(game.next(), true));
    $('restart').addEventListener('click', () => showQuestion(game.reset(), true));
    for (const button of document.querySelectorAll('[data-mode]')) {
      button.addEventListener('click', () => switchMode(button.dataset.mode));
    }
    showQuestion(game.next());
  } catch (error) {
    console.error('Before the Bulb could not start:', error);
    $('loading').classList.add('error');
    $('loading').textContent = 'The inventions didn’t load. Please try again.';
    const retry = element('button', 'quiet', 'Try again');
    retry.type = 'button';
    retry.addEventListener('click', () => location.reload());
    $('loading').append(retry);
    $('instruction').textContent = 'A small bump on our trip through time.';
  }
}
boot();
