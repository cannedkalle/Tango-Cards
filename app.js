const cards = window.TANGO_CARDS || [];
const home = document.querySelector("#home");
const gallerySection = document.querySelector("#gallerySection");
const gallery = document.querySelector("#gallery");
const ratingFiltersEl = document.querySelector("#ratingFilters");
const densityToggle = document.querySelector("#densityToggle");
const galleryHeading = document.querySelector("#galleryHeading");
const visibleCount = document.querySelector("#visibleCount");
const seriesCount = document.querySelector("#seriesCount");
const dialog = document.querySelector("#previewDialog");
const previewImage = document.querySelector("#previewImage");
const previewTitle = document.querySelector("#previewTitle");
const previewSeries = document.querySelector("#previewSeries");
const previewNumber = document.querySelector("#previewNumber");
const previewStatus = document.querySelector("#previewStatus");
const previewDownload = document.querySelector("#previewDownload");
const closePreview = document.querySelector("#closePreview");

const ratings = JSON.parse(localStorage.getItem("tangoCardRatings") || "{}");
const ratingFilters = ["All", "Rated", "Unrated", "Favorites"];
const expectedCardsPerSeries = 20;
let activeSeriesKey = "";
let ratingFilter = "All";

cards.forEach((card) => {
  card.key = card.key || card.src;
});

const seriesList = [
  { key: "series-a", label: "Series A", source: "Series A", href: "series-a/" },
  { key: "series-b", label: "Series B", source: "Series B", href: "series-b/" },
  { key: "series-c", label: "Series C", source: "Series C", href: "series-c/" },
  { key: "series-d", label: "Series D", source: "Series D Final", href: "series-d/" },
].map((series) => ({
  ...series,
  cards: cards.filter((card) => card.series === series.source),
}));

const seriesByKey = new Map(seriesList.map((series) => [series.key, series]));

function bracketCount(count) {
  return `[${count}]`;
}

function countLabel(count) {
  return `${bracketCount(count)} ${count === 1 ? "card" : "cards"}`;
}

function renderHome() {
  if (!home) return;
  const incomplete = seriesList.filter((series) => series.cards.length !== expectedCardsPerSeries);

  visibleCount.textContent = `${seriesList.length} series`;
  seriesCount.textContent = `${cards.length} generated images`;

  home.innerHTML = `
    ${
      incomplete.length
        ? `<div class="warning" role="status">
            ${incomplete
              .map((series) => `${series.label} has ${bracketCount(series.cards.length)}, expected ${bracketCount(expectedCardsPerSeries)}.`)
              .join(" ")}
          </div>`
        : ""
    }
    <div class="home-grid">
      ${seriesList
        .map((series) => {
          const cover = series.cards[0];
          const isComplete = series.cards.length === expectedCardsPerSeries;
          return `
            <a class="series-card" href="${series.href}">
              ${cover ? `<img src="${cover.src}" alt="" loading="lazy">` : `<span class="missing-cover"></span>`}
              <span class="series-card-copy">
                <span>
                  <span class="series-title">${series.label}</span>
                  <span class="series-action">Open gallery</span>
                </span>
                <span class="series-count ${isComplete ? "" : "is-short"}">${countLabel(series.cards.length)}</span>
              </span>
            </a>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderRatingFilters() {
  if (!ratingFiltersEl) return;
  ratingFiltersEl.innerHTML = ratingFilters
    .map((name) => `<button type="button" data-rating-filter="${name}" aria-pressed="${name === ratingFilter}">${name}</button>`)
    .join("");
}

function activeSeries() {
  return seriesByKey.get(activeSeriesKey);
}

function filteredCards() {
  const series = activeSeries();
  if (!series) return [];

  return series.cards.filter((card) => {
    const rating = ratings[card.key] || 0;
    return (
      ratingFilter === "All" ||
      (ratingFilter === "Rated" && rating > 0) ||
      (ratingFilter === "Unrated" && rating === 0) ||
      (ratingFilter === "Favorites" && rating === 5)
    );
  });
}

function ratingMarkup(card, label = "Rate this card") {
  const current = ratings[card.key] || 0;
  return `
    <span class="rating" role="group" aria-label="${label}">
      ${[1, 2, 3, 4, 5]
        .map(
          (value) => `
            <button
              type="button"
              class="star"
              data-rate="${value}"
              data-key="${card.key}"
              aria-label="${value} star${value === 1 ? "" : "s"}"
              aria-pressed="${current === value}"
              title="${value} star${value === 1 ? "" : "s"}"
            >${value <= current ? "★" : "☆"}</button>
          `,
        )
        .join("")}
    </span>
  `;
}

function renderGallery() {
  if (!gallery) return;
  const series = activeSeries();
  if (!series) return;

  const visible = filteredCards();
  galleryHeading.textContent = `${series.label} ${bracketCount(series.cards.length)}`;
  visibleCount.textContent = countLabel(visible.length);
  seriesCount.textContent = `${series.label} ${bracketCount(series.cards.length)}`;

  if (!visible.length) {
    gallery.innerHTML = `<div class="empty">No cards match this view.</div>`;
    return;
  }

  gallery.innerHTML = visible
    .map(
      (card) => `
        <article class="card" data-key="${card.key}">
          <button class="card-preview" type="button" data-key="${card.key}">
            <img src="${card.src}" alt="${card.title}" loading="lazy">
            <span class="card-meta">
              <span class="card-title">${card.title}</span>
              <span class="card-detail"><span class="tag">${series.label}</span>${card.number ? ` · #${card.number}` : ""} · ${card.status}</span>
            </span>
          </button>
          ${ratingMarkup(card)}
        </article>
      `,
    )
    .join("");
}

function showHome() {
  if (!home || !gallerySection) return;
  activeSeriesKey = "";
  home.classList.remove("is-hidden");
  gallerySection.classList.add("is-hidden");
  renderHome();
}

function showSeries(key) {
  if (!seriesByKey.has(key)) return;
  activeSeriesKey = key;
  ratingFilter = "All";
  home?.classList.add("is-hidden");
  gallerySection?.classList.remove("is-hidden");
  renderRatingFilters();
  renderGallery();
}

function openPreview(card) {
  if (!dialog) return;
  const series = activeSeries();
  previewImage.src = card.src;
  previewImage.alt = card.title;
  previewTitle.textContent = card.title;
  previewSeries.textContent = series?.label || card.series;
  previewNumber.textContent = card.number ? `#${card.number}` : "Unnumbered";
  previewStatus.textContent = card.status;
  previewDownload.href = card.src;
  previewDownload.download = `${card.id}.jpg`;
  document.querySelector("#previewRating").innerHTML = ratingMarkup(card, "Rate preview card");
  dialog.showModal();
}

ratingFiltersEl?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-rating-filter]");
  if (!button) return;
  ratingFilter = button.dataset.ratingFilter;
  renderRatingFilters();
  renderGallery();
});

densityToggle?.addEventListener("click", () => {
  gallery.classList.toggle("is-large");
  densityToggle.classList.toggle("is-active");
});

gallery?.addEventListener("click", (event) => {
  const ratingButton = event.target.closest("button[data-rate]");
  if (ratingButton) {
    setRating(ratingButton.dataset.key, Number(ratingButton.dataset.rate));
    return;
  }

  const button = event.target.closest(".card-preview");
  if (!button) return;
  const card = cards.find((item) => item.key === button.dataset.key);
  if (card) openPreview(card);
});

dialog?.addEventListener("click", (event) => {
  const ratingButton = event.target.closest("button[data-rate]");
  if (!ratingButton) return;
  event.stopPropagation();
  setRating(ratingButton.dataset.key, Number(ratingButton.dataset.rate));
  const card = cards.find((item) => item.key === ratingButton.dataset.key);
  if (card) document.querySelector("#previewRating").innerHTML = ratingMarkup(card, "Rate preview card");
});

closePreview?.addEventListener("click", () => dialog.close());

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

function setRating(key, value) {
  ratings[key] = ratings[key] === value ? 0 : value;
  localStorage.setItem("tangoCardRatings", JSON.stringify(ratings));
  renderGallery();
}

const pageSeriesKey = document.body.dataset.seriesKey;

if (pageSeriesKey) {
  showSeries(pageSeriesKey);
} else {
  renderHome();
}
