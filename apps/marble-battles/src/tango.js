const cardPool = [
  { name: "Ruby", color: "#ff5d4d" },
  { name: "Lemon", color: "#ffcf56" },
  { name: "Mint", color: "#67e25f" },
  { name: "Sky", color: "#48d1ff" },
  { name: "Grape", color: "#c99bff" },
  { name: "Rose", color: "#ff7ab8" },
  { name: "Tangerine", color: "#ff9f43" },
  { name: "Lagoon", color: "#54e6c1" }
];

export class TangoCards {
  constructor(elements) {
    this.elements = elements;
    this.cards = [];
    this.flipped = [];
    this.moves = 0;
    this.matches = 0;
    this.locked = false;

    this.elements.newGame.addEventListener("click", () => this.reset());
    this.elements.pairCount.addEventListener("change", () => this.reset());
    this.reset();
  }

  reset() {
    const pairCount = Number(this.elements.pairCount.value);
    const selected = cardPool.slice(0, pairCount);
    this.cards = shuffle([...selected, ...selected].map((card, index) => ({
      ...card,
      id: `${card.name}-${index}`,
      matched: false,
      faceUp: false
    })));
    this.flipped = [];
    this.moves = 0;
    this.matches = 0;
    this.locked = false;
    this.render();
  }

  render() {
    this.elements.stats.innerHTML = [
      ["Moves", this.moves],
      ["Matches", `${this.matches}/${this.cards.length / 2}`],
      ["Left", (this.cards.length / 2) - this.matches]
    ]
      .map(([label, value]) => `<span><strong>${value}</strong>${label}</span>`)
      .join("");

    this.elements.board.style.setProperty("--tango-columns", this.cards.length > 12 ? 4 : 3);
    this.elements.board.innerHTML = this.cards.map((card, index) => `
      <button
        class="memory-card${card.faceUp ? " is-face-up" : ""}${card.matched ? " is-matched" : ""}"
        type="button"
        data-card-index="${index}"
        aria-label="${card.faceUp || card.matched ? card.name : "Hidden card"}"
      >
        <span class="card-back">?</span>
        <span class="card-front" style="--card-color:${card.color}">
          <span class="card-color"></span>
          <strong>${card.name}</strong>
        </span>
      </button>
    `).join("");

    for (const cardButton of this.elements.board.querySelectorAll(".memory-card")) {
      cardButton.addEventListener("click", () => this.flip(Number(cardButton.dataset.cardIndex)));
    }
  }

  flip(index) {
    const card = this.cards[index];
    if (this.locked || card.faceUp || card.matched) return;

    card.faceUp = true;
    this.flipped.push(index);

    if (this.flipped.length === 2) {
      this.moves += 1;
      this.resolvePair();
    }

    this.render();
  }

  resolvePair() {
    const [firstIndex, secondIndex] = this.flipped;
    const first = this.cards[firstIndex];
    const second = this.cards[secondIndex];

    if (first.name === second.name) {
      first.matched = true;
      second.matched = true;
      this.matches += 1;
      this.flipped = [];
      return;
    }

    this.locked = true;
    window.setTimeout(() => {
      first.faceUp = false;
      second.faceUp = false;
      this.flipped = [];
      this.locked = false;
      this.render();
    }, 720);
  }
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
