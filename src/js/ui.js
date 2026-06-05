const ORCA_ICON = 'src/assets/orca-emoji.png';

const rouletteRanks = [
  { emoji: '🧜', name: 'Aquaman', tier: 'Tier I — Legendary', color: '#f0c040' },
  { emoji: '🐋', name: 'Humpback', tier: 'Tier II — Epic', color: '#c084fc' },
  { emoji: '', icon: ORCA_ICON, name: 'Killer Whale', tier: 'Tier III — Epic', color: '#7dd3fc' },
  { emoji: '🦈', name: 'Shark', tier: 'Tier IV — Rare', color: '#60a5fa' },
  { emoji: '🐬', name: 'Dolphin', tier: 'Tier V — Rare', color: '#34d399' },
  { emoji: '🐟', name: 'Fish', tier: 'Tier VI — Uncommon', color: '#4ade80' },
  { emoji: '🐙', name: 'Octopus', tier: 'Tier VII — Uncommon', color: '#f472b6' },
  { emoji: '🦀', name: 'Crab', tier: 'Tier VIII — Common', color: '#fb923c' },
  { emoji: '🦐', name: 'Shrimp', tier: 'Tier IX — Common', color: '#f9a8d4' },
  { emoji: '🦪', name: 'Oyster', tier: 'Tier X — Common', color: '#94a3b8' },
  { emoji: '🦠', name: 'Plankton', tier: 'Tier XI — Origin', color: '#64748b' }
];

let isRouletteBusy = false;

function rankSymbolMarkup(rank) {
  if (rank.icon) {
    return `<img class="rank-icon rank-icon-orca" src="${rank.icon}" alt="${rank.name}">`;
  }

  return `<span>${rank.emoji}</span>`;
}

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('nav');
  const pageOffset = window.scrollY;

  navbar.classList.toggle('sol', pageOffset > 60);

  document.querySelectorAll('.hbg1').forEach((layer) => {
    layer.style.transform = `translateY(${pageOffset * 0.14}px)`;
  });

  document.querySelectorAll('.hbg2').forEach((layer) => {
    layer.style.transform = `translateY(${pageOffset * 0.08}px)`;
  });

  document.querySelectorAll('.hbg3').forEach((layer) => {
    layer.style.transform = `translateY(${pageOffset * 0.11}px)`;
  });
});

(function revealOnScroll() {
  const animatedCards = document.querySelectorAll(
    '.rc,.rc-solo,.ksp,.rrow,.cc,.mc,.story-card,.story-big,.cp,.cfcard,.mq-item,.cni'
  );

  animatedCards.forEach((card, index) => {
    const delay = (index % 10) * 0.055;

    card.style.opacity = '0';
    card.style.transform = 'translateY(14px)';
    card.style.transition =
      `opacity .55s ${delay}s ease, transform .55s ${delay}s ease, ` +
      'background .3s, border-color .3s, box-shadow .3s';
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      });
    },
    { threshold: 0.05 }
  );

  animatedCards.forEach((card) => revealObserver.observe(card));

  const ambientObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('vis', entry.isIntersecting);
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.amb').forEach((shape) => ambientObserver.observe(shape));
})();

(function animateRankBars() {
  const rowsWrapper = document.getElementById('rrows');

  if (!rowsWrapper) {
    return;
  }

  let hasStarted = false;

  const barsObserver = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting || hasStarted) {
        return;
      }

      hasStarted = true;

      document.querySelectorAll('.rrb').forEach((bar) => {
        const percentage = bar.closest('.rrow').dataset.pct;
        bar.style.width = `${percentage}%`;
      });
    },
    { threshold: 0.15 }
  );

  barsObserver.observe(rowsWrapper);
})();

(function initRankingSystem() {
  const input = document.getElementById('rank-token-input');
  const button = document.getElementById('rank-token-btn');
  const result = document.getElementById('rank-result');
  const resultArt = document.getElementById('rank-result-art');
  const gallery = document.getElementById('rank-gallery');
  const legendaryStrip = document.getElementById('legendary-strip');

  if (!input || !button || !result) {
    return;
  }

  const rankingPath = 'src/data/kasranks-ranking.json';
  const thumbPath = (tokenId) => `src/assets/ranking-thumbs/${tokenId}.jpg`;
  const legendaryIds = [1, 9, 25, 56, 103, 166, 244, 330, 432, 541, 658];
  const legendaryIdSet = new Set(legendaryIds);
  const previewLimit = gallery ? Number(gallery.dataset.limit || 200) : 0;
  const tokenMeta = window.KASRANKS_META || {};
  const shareCurve = {
    rankedSupply: 771,
    floorHash: 5.85,
    topHash: 100,
    power: 2.235,
    legendarySharePercent: 0.5
  };
  const normalHashTotal = Array.from({ length: shareCurve.rankedSupply }, (_, index) => {
    const rank = index + 1;
    const depth = (shareCurve.rankedSupply - rank + 1) / shareCurve.rankedSupply;

    return shareCurve.floorHash + ((shareCurve.topHash - shareCurve.floorHash) * (depth ** shareCurve.power));
  }).reduce((total, value) => total + value, 0);
  let rankByToken = new Map();
  let ranking = [];

  function getMeta(tokenId) {
    return tokenMeta[String(tokenId)] || {};
  }

  function getRankLine(rank) {
    return rank ? `Rank #${rank}` : 'Legendary';
  }

  function getSharePercent(rank, isLegendary) {
    if (isLegendary) {
      return shareCurve.legendarySharePercent;
    }

    if (!rank) {
      return 0;
    }

    const depth = (shareCurve.rankedSupply - rank + 1) / shareCurve.rankedSupply;
    const hash = shareCurve.floorHash + ((shareCurve.topHash - shareCurve.floorHash) * (depth ** shareCurve.power));
    const legendaryHashTotal = normalHashTotal * (11 / 189);
    const totalHash = normalHashTotal + legendaryHashTotal;

    return (hash / totalHash) * 100;
  }

  function getShareLine(rank, isLegendary) {
    return `${getSharePercent(rank, isLegendary).toFixed(4)}% share`;
  }

  function getTraitSummary(meta) {
    const traits = (meta.traits || []).filter((trait) => trait.type !== 'Creature');

    if (!traits.length) {
      return `${meta.creature || 'KASRANKS'} base. No extra traits.`;
    }

    return traits.map((trait) => trait.value).join(' / ');
  }

  function setResult(tokenId, rank) {
    const isLegendary = legendaryIdSet.has(tokenId);
    const meta = getMeta(tokenId);
    const name = meta.name || `Token #${tokenId}`;

    resultArt.innerHTML =
      `<img src="${thumbPath(tokenId)}" alt="KASRANKS token ${tokenId}" loading="lazy">`;

    result.querySelector('.rank-result-main').classList.toggle('legendary', isLegendary);
    result.querySelector('.rank-result-k').textContent = name;
    result.querySelector('.rank-result-main').textContent = getRankLine(rank);
    result.dataset.token = tokenId;

    result.querySelector('.rank-result-sub').textContent =
      isLegendary
        ? `${name} is legendary.`
        : getTraitSummary(meta);

    let share = result.querySelector('.rank-result-share');

    if (!share) {
      share = document.createElement('div');
      share.className = 'rank-result-share';
      result.querySelector('.rank-result-copy').appendChild(share);
    }

    share.textContent = getShareLine(rank, isLegendary);
  }

  function setMessage(title, detail) {
    resultArt.innerHTML = '';
    delete result.dataset.token;
    result.querySelector('.rank-result-k').textContent = 'KASRANKS';
    result.querySelector('.rank-result-main').classList.remove('legendary');
    result.querySelector('.rank-result-main').textContent = title;
    result.querySelector('.rank-result-sub').textContent = detail;
    result.querySelector('.rank-result-share')?.remove();
  }

  function checkToken() {
    const tokenId = Number(input.value);

    if (!Number.isInteger(tokenId) || tokenId < 1 || tokenId > 782) {
      setMessage('Enter token 1 to 782.', 'The lookup uses KASRANKS token IDs from the final ranking file.');
      return;
    }

    const rank = rankByToken.get(tokenId);

    if (!rank && legendaryIdSet.has(tokenId)) {
      setResult(tokenId, null);
      return;
    }

    if (!rank) {
      setMessage('Token not found.', 'That token ID is not present in the loaded ranking file.');
      return;
    }

    setResult(tokenId, rank);
  }

  function renderLegendaryStrip() {
    const legendary = `<b>Legendary IDs</b> ${legendaryIds
      .map((tokenId) => `token ${tokenId}`)
      .join(' &middot; ')}`;

    legendaryStrip.innerHTML = legendary;
  }

  function renderGallery() {
    if (!gallery) {
      return;
    }

    const galleryEntries = [
      ...legendaryIds.map((tokenId) => ({ tokenId, newRank: null, isLegendary: true })),
      ...ranking.map((entry) => ({ ...entry, isLegendary: false }))
    ].slice(0, previewLimit);

    gallery.innerHTML = galleryEntries
      .map((entry) => {
        const meta = getMeta(entry.tokenId);
        const name = meta.name || `Token #${entry.tokenId}`;
        const creature = meta.creature || 'KASRANKS';
        const traits = (meta.traits || []).filter((trait) => trait.type !== 'Creature');
        const traitLine = traits.length
          ? traits.slice(0, 2).map((trait) => trait.value).join(' / ')
          : `${creature} base.`;

        return `
          <button class="rank-card${entry.isLegendary ? ' legendary' : ''}" type="button" data-token="${entry.tokenId}">
            <img src="${thumbPath(entry.tokenId)}" alt="KASRANKS token ${entry.tokenId}" loading="lazy">
            <span class="rank-card-copy">
              <span class="rank-card-rank">${getRankLine(entry.newRank)}</span>
              <span class="rank-card-name">${name}</span>
              <span class="rank-card-creature">${creature}</span>
              <span class="rank-card-share">${getShareLine(entry.newRank, entry.isLegendary)}</span>
              <span class="rank-card-desc">${traitLine}</span>
            </span>
          </button>
        `;
      })
      .join('');

    gallery.querySelectorAll('.rank-card').forEach((card) => {
      card.addEventListener('click', () => {
        const tokenId = Number(card.dataset.token);

        input.value = tokenId;
        checkToken();
        openRankPreview(tokenId);
      });
    });
  }

  function openRankPreview(tokenId) {
    const rank = rankByToken.get(tokenId);

    if (!rank && !legendaryIdSet.has(tokenId)) {
      return;
    }

    const meta = getMeta(tokenId);
    const name = meta.name || `Token #${tokenId}`;
    const traits = meta.traits || [];
    const isLegendary = legendaryIdSet.has(tokenId);
    let modal = document.getElementById('rank-preview');

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'rank-preview';
      modal.className = 'rank-preview';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <button class="rank-preview-close" type="button" aria-label="Close preview">&times;</button>
      <div class="rank-preview-card">
        <img class="rank-preview-art" src="${thumbPath(tokenId)}" alt="${name}">
        <div class="rank-preview-copy">
          <div class="rank-preview-ey">${getRankLine(rank)}</div>
          <div class="rank-preview-name">${name}</div>
          <div class="rank-preview-sub">${meta.creature || 'KASRANKS'} creature</div>
          <div class="rank-preview-share">${getShareLine(rank, isLegendary)}</div>
          <div class="rank-preview-traits">
            ${traits.map((trait) => `
              <div class="rank-preview-trait">
                <span>${trait.type}</span>
                <strong>${trait.value}</strong>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    modal.classList.add('vis');
    document.body.classList.add('rank-preview-open');

    const closePreview = () => {
      modal.classList.remove('vis');
      document.body.classList.remove('rank-preview-open');
    };

    modal.querySelector('.rank-preview-close').onclick = closePreview;
    modal.querySelector('.rank-preview-card').onwheel = (event) => {
      event.stopPropagation();
    };
    modal.onclick = (event) => {
      if (event.target === modal) {
        closePreview();
      }
    };
  }

  function loadRanking(data) {
    ranking = data.swaps.slice().sort((a, b) => a.newRank - b.newRank);
    rankByToken = new Map(ranking.map((entry) => [entry.tokenId, entry.newRank]));

    renderLegendaryStrip();
    renderGallery();

    input.value = legendaryIds[0];
    setResult(legendaryIds[0], null);
  }

  if (window.KASRANKS_RANKING) {
    loadRanking(window.KASRANKS_RANKING);
  } else {
    fetch(rankingPath)
      .then((response) => response.json())
      .then(loadRanking)
      .catch(() => {
        setMessage('Ranking file did not load.', 'Refresh the page and make sure the ranking data file is beside the website.');
        legendaryStrip.textContent = 'Ranking file did not load.';
      });
  }

  button.addEventListener('click', checkToken);
  result.addEventListener('click', () => {
    const tokenId = Number(result.dataset.token);

    if (tokenId) {
      openRankPreview(tokenId);
    }
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      checkToken();
    }
  });
})();

function spinRoulette(event) {
  if (event && event.type === 'touchend' && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  if (isRouletteBusy) {
    return;
  }

  isRouletteBusy = true;

  const button = document.getElementById('roulette-btn');
  const display = document.getElementById('roulette-display');
  const name = document.getElementById('roulette-name');
  const tier = document.getElementById('roulette-tier');

  button.style.opacity = '.4';
  button.style.pointerEvents = 'none';

  let turns = 0;
  const maxTurns = 22 + Math.floor(Math.random() * 18);
  let timeoutDelay = 40;

  function drawRank(rank) {
    display.innerHTML = rankSymbolMarkup(rank);

    display.style.filter = `drop-shadow(0 0 28px ${rank.color})`;
    name.textContent = rank.name;
    name.style.color = rank.color;
    tier.textContent = '';
    tier.style.color = rank.color;
  }

  function getWeightedRank() {
    const weights = [1, 2, 4, 6, 8, 10, 11, 13, 14, 15, 16];
    const total = weights.reduce((sum, value) => sum + value, 0);

    let cursor = Math.random() * total;

    for (let i = 0; i < weights.length; i += 1) {
      cursor -= weights[i];

      if (cursor <= 0) {
        return rouletteRanks[i];
      }
    }

    return rouletteRanks[rouletteRanks.length - 1];
  }

  function run() {
    const currentRank = rouletteRanks[Math.floor(Math.random() * rouletteRanks.length)];
    drawRank(currentRank);
    turns += 1;

    if (turns < maxTurns) {
      if (timeoutDelay < 180) {
        timeoutDelay *= 1.07;
      }

      window.setTimeout(run, timeoutDelay);
      return;
    }

    const finalRank = getWeightedRank();

    display.innerHTML = rankSymbolMarkup(finalRank);
    display.style.filter = `drop-shadow(0 0 48px ${finalRank.color})`;
    name.textContent = finalRank.name;
    name.style.color = finalRank.color;
    tier.textContent = '';
    tier.style.color = finalRank.color;
    button.textContent = 'Spin Again ↻';
    button.style.opacity = '1';
    button.style.pointerEvents = 'auto';

    isRouletteBusy = false;
  }

  run();
}
