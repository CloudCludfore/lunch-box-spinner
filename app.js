const foods = [
  { id: 'com-tam', name: 'Cơm tấm sườn bì', emoji: '🍛', rarity: 'common', weight: 7, price: '45–60K', tag: 'Quốc dân', description: 'Sườn nướng thơm lừng, bì chả đầy đủ — lựa chọn an toàn nhưng không bao giờ nhàm chán.' },
  { id: 'banh-mi', name: 'Bánh mì đặc biệt', emoji: '🥖', rarity: 'common', weight: 7, price: '25–40K', tag: 'Nhanh gọn', description: 'Giòn rụm bên ngoài, đầy đặn bên trong. Ăn nhanh để còn tranh thủ ngủ trưa.' },
  { id: 'bun-thit-nuong', name: 'Bún thịt nướng', emoji: '🥗', rarity: 'common', weight: 7, price: '40–55K', tag: 'Dễ ăn', description: 'Thịt nướng, rau xanh, đồ chua và nước mắm — combo cân bằng của mọi buổi trưa.' },
  { id: 'com-ga', name: 'Cơm gà xối mỡ', emoji: '🍗', rarity: 'common', weight: 7, price: '45–60K', tag: 'No căng', description: 'Da gà giòn tan, cơm vàng thơm béo. Chiều nay chắc chắn làm việc rất có năng lượng.' },
  { id: 'banh-cuon', name: 'Bánh cuốn nóng', emoji: '🥟', rarity: 'common', weight: 7, price: '30–45K', tag: 'Nhẹ bụng', description: 'Bánh mỏng mềm, hành phi thơm và chả lụa. Nhẹ nhàng nhưng vẫn đủ sức qua buổi chiều.' },
  { id: 'xoi-man', name: 'Xôi mặn thập cẩm', emoji: '🍚', rarity: 'common', weight: 7, price: '25–40K', tag: 'Chắc bụng', description: 'Một phần nhỏ nhưng sức mạnh lớn. Phù hợp cho ngày deadline đang dí sát.' },

  { id: 'pho-bo', name: 'Phở bò tái nạm', emoji: '🍜', rarity: 'uncommon', weight: 6, price: '50–75K', tag: 'Kinh điển', description: 'Nước dùng nóng hổi, thịt bò mềm và chút hành thơm — một drop rất khó để chê.' },
  { id: 'bun-bo-hue', name: 'Bún bò Huế', emoji: '🥘', rarity: 'uncommon', weight: 6, price: '50–70K', tag: 'Đậm vị', description: 'Cay thơm, đậm đà, topping ngập mặt. Món này đủ sức đánh thức mọi cuộc họp chiều.' },
  { id: 'bun-cha', name: 'Bún chả Hà Nội', emoji: '🍲', rarity: 'uncommon', weight: 6, price: '50–70K', tag: 'Nướng thơm', description: 'Chả nướng xém cạnh, nước chấm chua ngọt và rau sống. Một lựa chọn rất biết chiều lòng người.' },
  { id: 'mi-quang', name: 'Mì Quảng', emoji: '🍝', rarity: 'uncommon', weight: 6, price: '45–65K', tag: 'Miền Trung', description: 'Sợi mì dai, nước dùng đậm, bánh tráng giòn — bữa trưa có đủ mọi kết cấu thú vị.' },
  { id: 'com-chien', name: 'Cơm chiên Dương Châu', emoji: '🥡', rarity: 'uncommon', weight: 6, price: '45–65K', tag: 'Đầy đặn', description: 'Cơm rang tơi hạt cùng đủ loại topping. Không hào nhoáng, nhưng hiệu quả tuyệt đối.' },

  { id: 'pizza', name: 'Pizza phô mai', emoji: '🍕', rarity: 'rare', weight: 4, price: '90–150K', tag: 'Đổi gió', description: 'Đế nóng giòn và phô mai kéo sợi. Hôm nay bạn xứng đáng với một bữa trưa hơi quá tay.' },
  { id: 'sushi', name: 'Sushi set', emoji: '🍣', rarity: 'rare', weight: 4, price: '120–180K', tag: 'Nhật Bản', description: 'Một set sushi tươi gọn gàng, đẹp mắt. Bữa trưa nay bỗng nhiên sang hẳn lên.' },
  { id: 'ga-han', name: 'Gà rán Hàn Quốc', emoji: '🍗', rarity: 'rare', weight: 4, price: '90–140K', tag: 'Giòn cay', description: 'Vỏ giòn, sốt cay ngọt bám đều. Chuẩn bị thêm nước và bỏ qua chuyện đếm calories.' },
  { id: 'ramen', name: 'Ramen Tonkotsu', emoji: '🍜', rarity: 'rare', weight: 4, price: '100–160K', tag: 'Umami', description: 'Nước dùng xương hầm béo ngậy, mì dai và trứng lòng đào — drop hiếm rất đáng tiền.' },

  { id: 'lau-thai', name: 'Lẩu Thái hải sản', emoji: '🍲', rarity: 'epic', weight: 3, price: '250–400K', tag: 'Rủ đồng đội', description: 'Chua cay bùng nổ và hải sản đầy nồi. Drop này bắt buộc phải kéo cả team đi cùng.' },
  { id: 'steak', name: 'Beefsteak medium rare', emoji: '🥩', rarity: 'epic', weight: 3, price: '250–450K', tag: 'Sang xịn', description: 'Miếng bò mọng nước áp chảo vừa tới. Ví có thể buồn, nhưng vị giác chắc chắn vui.' },
  { id: 'sashimi', name: 'Sashimi thượng hạng', emoji: '🐟', rarity: 'epic', weight: 3, price: '300–500K', tag: 'Tươi sống', description: 'Cá tươi cắt dày, vị ngọt tự nhiên. Một bữa trưa chất lượng ở cấp độ sử thi.' },

  { id: 'buffet-hai-san', name: 'Buffet hải sản', emoji: '🦞', rarity: 'legendary', weight: 1.5, price: '600K+', tag: 'Tất tay', description: 'Tôm, cua, hàu và không giới hạn. Huyền thoại đã xuất hiện — chiều nay xin phép nghỉ tiêu hóa.' },
  { id: 'omakase', name: 'Omakase', emoji: '👨‍🍳', rarity: 'legendary', weight: 1.5, price: '1.000K+', tag: 'Chef chọn', description: 'Giao toàn bộ bữa ăn cho đầu bếp. Bạn vừa random ra một trải nghiệm đúng nghĩa.' }
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
  const odds = Object.keys(rarityInfo).map((rarity) => ({
    rarity,
    percentage: foods
      .filter((food) => food.rarity === rarity)
      .reduce((sum, food) => sum + food.weight, 0)
  }));

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
    value.textContent = `${percentage}%`;

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
