const rouletteRanks = [
  { emoji: '🧜', name: 'Aquaman', tier: 'Tier I — Legendary', color: '#f0c040' },
  { emoji: '🐋', name: 'Humpback', tier: 'Tier II — Epic', color: '#c084fc' },
  { emoji: '🐳', name: 'Blue Whale', tier: 'Tier III — Epic', color: '#7dd3fc' },
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
    if (turns === 0) {
      display.innerHTML = `<span>${rank.emoji}</span>`;
    } else {
      display.firstChild.textContent = rank.emoji;
    }

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

    display.firstChild.textContent = finalRank.emoji;
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
