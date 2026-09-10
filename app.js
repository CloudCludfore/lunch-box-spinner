const foods = [
  { id: 'com-pho-bo', name: 'Cơm phở bò', emoji: '\u{1F35C}', rarity: 'common', weight: 6, price: '50–65K', tag: 'Bò thơm', description: 'Phở bò nóng hổi với nước dùng đậm đà và thịt bò mềm, hợp cho một bữa trưa ấm bụng.' },
  { id: 'com-pho-ga', name: 'Cơm phở gà', emoji: '\u{1F414}', rarity: 'common', weight: 6, price: '50–70K', tag: 'Thanh vị', description: 'Phở gà thanh ngọt, thịt gà mềm và thơm, nhẹ nhàng nhưng vẫn đủ no cho buổi chiều.' },

  { id: 'bun-rieu', name: 'Bún riêu', emoji: '\u{1F345}', rarity: 'uncommon', weight: 7, price: '45K+', tag: 'Chua thanh', description: 'Nước dùng chua dịu, riêu cua thơm béo và cà chua đậm vị — một lựa chọn quen thuộc dễ ăn.' },
  { id: 'bun-suon-chua', name: 'Bún sườn chua', emoji: '\u{1F958}', rarity: 'uncommon', weight: 7, price: '45K+', tag: 'Chua ngọt', description: 'Sườn mềm, nước dùng chua thanh và rau thơm tạo nên một tô bún tròn vị.' },
  { id: 'bun-cha', name: 'Bún chả', emoji: '\u{1F356}', rarity: 'uncommon', weight: 7, price: '45K+', tag: 'Nướng thơm', description: 'Chả nướng xém cạnh ăn cùng bún, rau sống và nước chấm chua ngọt đúng điệu.' },
  { id: 'banh-cuon', name: 'Bánh cuốn', emoji: '\u{1F95F}', rarity: 'uncommon', weight: 7, price: '30–50K', tag: 'Nhẹ bụng', description: 'Bánh cuốn mềm mỏng, hành phi thơm và chả lụa — gọn nhẹ mà vẫn đủ sức qua buổi chiều.' },

  { id: 'my-cay', name: 'Mỳ cay', emoji: '\u{1F336}\uFE0F', rarity: 'rare', weight: 4, price: '52–75K', tag: 'Cay nóng', description: 'Một tô mỳ cay nóng hổi với vị cay bùng nổ, dành cho ngày cần đánh thức mọi giác quan.' },
  { id: 'banh-my-chao', name: 'Bánh mỳ chảo', emoji: '\u{1F373}', rarity: 'rare', weight: 4, price: '45–55K', tag: 'Đầy đặn', description: 'Bánh mỳ giòn ăn cùng trứng, pate và nước sốt nóng trong chảo — no lâu và rất bắt vị.' },

  { id: 'lau-my-cay', name: 'Lẩu mỳ cay', emoji: '\u{1FAD5}', rarity: 'legendary', weight: 1.5, price: '350K', tag: 'Rủ đồng đội', description: 'Nồi lẩu mỳ cay nghi ngút khói với topping đầy đặn, phù hợp để cả team cùng chinh phục.' },
  { id: 'bia', name: 'Bia', emoji: '\u{1F37A}', rarity: 'legendary', weight: 1.5, price: 'Unlimited', tag: 'Không giới hạn', description: 'Bia không giới hạn đã xuất hiện — một kết quả huyền thoại dành cho cuộc vui thật dài.' }
];

const rarityInfo = {
  common: { label: 'Phổ thông', color: '#a8b2c1' },
  uncommon: { label: 'Ít gặp', color: '#4ad17d' },
  rare: { label: 'Hiếm', color: '#4c8dff' },
  epic: { label: 'Sử thi', color: '#b95cff' },
  legendary: { label: 'Huyền thoại', color: '#ffb000' }
};

const rouletteTrack = document.querySelector('#rouletteTrack');
const rouletteViewport = document.querySelector('#rouletteViewport');
const openButton = document.querySelector('#openButton');
const statusText = document.querySelector('#statusText');
const spinCountElement = document.querySelector('#spinCount');
const oddsGrid = document.querySelector('#oddsGrid');
const historyList = document.querySelector('#historyList');
const clearHistoryButton = document.querySelector('#clearHistory');
const soundToggle = document.querySelector('#soundToggle');
const resultDialog = document.querySelector('#resultDialog');
const closeDialogButton = document.querySelector('#closeDialog');
const acceptResultButton = document.querySelector('#acceptResult');
const rerollButton = document.querySelector('#rerollButton');
const confettiLayer = document.querySelector('#confettiLayer');

const HISTORY_KEY = 'lunchdrop-history-v1';
const COUNT_KEY = 'lunchdrop-spin-count-v1';
const WINNER_INDEX = 48;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let spinning = false;
let soundEnabled = true;
let audioContext = null;
let history = readHistory();
let spinCount = readSpinCount();
let lastResult = null;

function randomUnit() {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] / 4294967296;
  }
  return Math.random();
}

function weightedPick() {
  const total = foods.reduce((sum, food) => sum + food.weight, 0);
  let roll = randomUnit() * total;

  for (const food of foods) {
    roll -= food.weight;
    if (roll < 0) return food;
  }

  return foods[foods.length - 1];
}

function createFoodCard(food) {
  const card = document.createElement('article');
  card.className = 'food-card';
  card.dataset.rarity = food.rarity;
  card.dataset.foodId = food.id;

  const rarity = document.createElement('span');
  rarity.className = 'food-rarity';
  rarity.textContent = rarityInfo[food.rarity].label;

  const emoji = document.createElement('div');
  emoji.className = 'food-emoji';
  emoji.textContent = food.emoji;
  emoji.setAttribute('aria-hidden', 'true');

  const name = document.createElement('h3');
  name.textContent = food.name;

  const price = document.createElement('small');
  price.textContent = food.price;

  card.append(rarity, emoji, name, price);
  return card;
}

function renderTrack(items) {
  const fragment = document.createDocumentFragment();
  items.forEach((food) => fragment.append(createFoodCard(food)));
  rouletteTrack.replaceChildren(fragment);
}

function buildIdleTrack() {
  const items = Array.from({ length: 20 }, () => weightedPick());
  renderTrack(items);
}

function renderOdds() {
  const totalWeight = foods.reduce((sum, food) => sum + food.weight, 0);
  const odds = Object.keys(rarityInfo).map((rarity) => {
    const rarityWeight = foods
      .filter((food) => food.rarity === rarity)
      .reduce((sum, food) => sum + food.weight, 0);
    const percentage = totalWeight > 0 ? (rarityWeight / totalWeight) * 100 : 0;

    return { rarity, percentage };
  });

  const fragment = document.createDocumentFragment();
  odds.forEach(({ rarity, percentage }) => {
    const card = document.createElement('article');
    card.className = 'odd-card';
    card.dataset.rarity = rarity;

    const line = document.createElement('div');
    line.className = 'odd-line';
    const label = document.createElement('strong');
    label.textContent = rarityInfo[rarity].label;
    const value = document.createElement('span');
    const formattedPercentage = Number.isInteger(percentage) ? percentage : percentage.toFixed(1);
    value.textContent = `${formattedPercentage}%`;

    card.append(line, label, value);
    fragment.append(card);
  });
  oddsGrid.replaceChildren(fragment);
}

function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((entry) => foods.some((food) => food.id === entry.foodId)).slice(0, 8) : [];
  } catch {
    return [];
  }
}

function readSpinCount() {
  try {
    const value = Number.parseInt(localStorage.getItem(COUNT_KEY) || '0', 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveProgress() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    localStorage.setItem(COUNT_KEY, String(spinCount));
  } catch {
    // The game still works when storage is unavailable.
  }
}

function renderHistory() {
  if (!history.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-history';
    empty.textContent = 'Chưa có món nào được mở. Vận may đầu tiên đang chờ bạn.';
    historyList.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  history.forEach((entry) => {
    const food = foods.find((item) => item.id === entry.foodId);
    if (!food) return;

    const item = document.createElement('article');
    item.className = 'history-item';
    item.dataset.rarity = food.rarity;

    const emoji = document.createElement('div');
    emoji.className = 'history-emoji';
    emoji.textContent = food.emoji;

    const info = document.createElement('div');
    info.className = 'history-info';
    const name = document.createElement('strong');
    name.textContent = food.name;
    const meta = document.createElement('span');
    const time = new Date(entry.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    meta.textContent = `${rarityInfo[food.rarity].label.toUpperCase()} · ${time}`;

    info.append(name, meta);
    item.append(emoji, info);
    fragment.append(item);
  });
  historyList.replaceChildren(fragment);
}

function getAudioContext() {
  if (!soundEnabled) return null;
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function playTone(frequency = 620, duration = 0.025, volume = 0.025) {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'square';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

function startTickSequence(duration) {
  if (!soundEnabled || reducedMotion) return;
  const startedAt = performance.now();

  function tick() {
    if (!spinning) return;
    const progress = Math.min((performance.now() - startedAt) / duration, 1);
    playTone(480 + progress * 170, 0.018, 0.018);
    if (progress < 0.94) {
      const delay = 45 + Math.pow(progress, 2.4) * 260;
      window.setTimeout(tick, delay);
    }
  }

  tick();
}

function setButtonSpinning(isSpinning) {
  openButton.disabled = isSpinning;
  const title = openButton.querySelector('.button-copy b');
  const subtitle = openButton.querySelector('.button-copy small');
  title.textContent = isSpinning ? 'ĐANG MỞ HÒM...' : 'MỞ HÒM NGAY';
  subtitle.textContent = isSpinning ? 'VẬN MAY ĐANG CHẠY' : 'MIỄN PHÍ · KHÔNG HỐI HẬN';
}

function spin() {
  if (spinning) return;
  if (resultDialog.open) resultDialog.close();

  spinning = true;
  lastResult = weightedPick();
  const reel = Array.from({ length: 58 }, () => weightedPick());
  reel[WINNER_INDEX] = lastResult;
  renderTrack(reel);

  rouletteTrack.style.transition = 'none';
  rouletteTrack.style.transform = 'translate3d(0, 0, 0)';
  rouletteTrack.getBoundingClientRect();

  setButtonSpinning(true);
  statusText.textContent = 'Hòm đang mở... Kim dừng ở đâu, bữa trưa chốt ở đó.';

  const duration = reducedMotion ? 700 : 5100;
  const winnerCard = rouletteTrack.children[WINNER_INDEX];
  const cardCenter = winnerCard.offsetLeft + winnerCard.offsetWidth / 2;
  const viewportCenter = rouletteViewport.clientWidth / 2;
  const safeJitter = reducedMotion ? 0 : (randomUnit() - 0.5) * winnerCard.offsetWidth * 0.42;
  const targetOffset = cardCenter - viewportCenter + safeJitter;

  startTickSequence(duration);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      rouletteTrack.style.transition = `transform ${duration}ms cubic-bezier(0.08, 0.72, 0.12, 1)`;
      rouletteTrack.style.transform = `translate3d(${-targetOffset}px, 0, 0)`;
    });
  });

  window.setTimeout(() => finishSpin(lastResult), duration + 120);
}

function finishSpin(food) {
  spinning = false;
  spinCount += 1;
  spinCountElement.textContent = String(spinCount);
  history.unshift({ foodId: food.id, timestamp: Date.now() });
  history = history.slice(0, 8);
  saveProgress();
  renderHistory();
  setButtonSpinning(false);
  statusText.textContent = `Đã mở được ${food.name} — ${rarityInfo[food.rarity].label}!`;
  playTone(food.rarity === 'legendary' ? 1040 : 820, 0.18, 0.06);
  showResult(food);
}

function showResult(food) {
  const rarity = rarityInfo[food.rarity];
  document.querySelector('#resultGlow').style.setProperty('--result-color', rarity.color);
  const rarityElement = document.querySelector('#resultRarity');
  rarityElement.textContent = rarity.label;
  rarityElement.style.color = rarity.color;
  document.querySelector('#resultEmoji').textContent = food.emoji;
  document.querySelector('#resultName').textContent = food.name;
  document.querySelector('#resultDescription').textContent = food.description;
  document.querySelector('#resultPrice').textContent = food.price;
  document.querySelector('#resultTag').textContent = food.tag;

  resultDialog.showModal();
  launchConfetti(rarity.color, food.rarity === 'legendary' ? 70 : 38);
}

function launchConfetti(primaryColor, count) {
  if (reducedMotion) return;
  const colors = [primaryColor, '#ffffff', '#ffb000', '#ff7a00'];
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    piece.style.left = `${12 + randomUnit() * 76}%`;
    piece.style.setProperty('--x', `${(randomUnit() - 0.5) * 520}px`);
    piece.style.setProperty('--rotate', `${180 + randomUnit() * 900}deg`);
    piece.style.setProperty('--fall-time', `${1.25 + randomUnit() * 1.25}s`);
    piece.style.setProperty('--confetti-color', colors[Math.floor(randomUnit() * colors.length)]);
    piece.style.animationDelay = `${randomUnit() * 0.28}s`;
    fragment.append(piece);
  }

  confettiLayer.replaceChildren(fragment);
  window.setTimeout(() => confettiLayer.replaceChildren(), 2900);
}

openButton.addEventListener('click', spin);
rerollButton.addEventListener('click', () => {
  resultDialog.close();
  window.setTimeout(spin, 180);
});
closeDialogButton.addEventListener('click', () => resultDialog.close());
acceptResultButton.addEventListener('click', () => {
  resultDialog.close();
  statusText.textContent = `${lastResult?.name || 'Món ăn'} đã được chốt. Chúc bạn ngon miệng!`;
});
resultDialog.addEventListener('click', (event) => {
  if (event.target === resultDialog) resultDialog.close();
});
clearHistoryButton.addEventListener('click', () => {
  history = [];
  saveProgress();
  renderHistory();
});
soundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute('aria-pressed', String(soundEnabled));
  soundToggle.textContent = soundEnabled ? '♪' : '×';
  if (soundEnabled) playTone(720, 0.06, 0.035);
});

buildIdleTrack();
renderOdds();
renderHistory();
spinCountElement.textContent = String(spinCount);
