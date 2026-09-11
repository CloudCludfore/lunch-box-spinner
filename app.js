import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const foods = [
  { id: 'com-pho-bo', name: 'Cơm phở bò', emoji: '\u{1F35C}', rarity: 'common', weight: 6, price: '50–65K', tag: 'Bò thơm', description: 'Phở bò nóng hổi với nước dùng đậm đà và thịt bò mềm, hợp cho một bữa trưa ấm bụng.' },
  { id: 'com-pho-ga', name: 'Cơm phở gà', emoji: '\u{1F414}', rarity: 'common', weight: 6, price: '50–70K', tag: 'Thanh vị', description: 'Phở gà thanh ngọt, thịt gà mềm và thơm, nhẹ nhàng nhưng vẫn đủ no cho buổi chiều.' },
  { id: 'bun-rieu', name: 'Bún riêu', emoji: '\u{1F345}', rarity: 'uncommon', weight: 7, price: '45K+', tag: 'Chua thanh', description: 'Nước dùng chua dịu, riêu cua thơm béo và cà chua đậm vị — một lựa chọn quen thuộc dễ ăn.' },
  { id: 'bun-suon-chua', name: 'Bún sườn chua', emoji: '\u{1F958}', rarity: 'uncommon', weight: 7, price: '45K+', tag: 'Chua ngọt', description: 'Sườn mềm, nước dùng chua thanh và rau thơm tạo nên một tô bún tròn vị.' },
  { id: 'bun-cha', name: 'Bún chả', emoji: '\u{1F356}', rarity: 'uncommon', weight: 7, price: '45K+', tag: 'Nướng thơm', description: 'Chả nướng xém cạnh ăn cùng bún, rau sống và nước chấm chua ngọt đúng điệu.' },
  { id: 'banh-cuon', name: 'Bánh cuốn', emoji: '\u{1F95F}', rarity: 'uncommon', weight: 7, price: '30–50K', tag: 'Nhẹ bụng', description: 'Bánh cuốn mềm mỏng, hành phi thơm và chả lụa — gọn nhẹ mà vẫn đủ sức qua buổi chiều.' },
  { id: 'my-cay', name: 'Mỳ cay', emoji: '\u{1F336}\uFE0F', rarity: 'rare', weight: 4, price: '52–75K', tag: 'Cay nóng', description: 'Một tô mỳ cay nóng hổi với vị cay bùng nổ, dành cho ngày cần đánh thức mọi giác quan.' },
  { id: 'banh-my-chao', name: 'Bánh mỳ chảo', emoji: '\u{1F373}', rarity: 'epic', weight: 4, price: '45–55K', tag: 'Đầy đặn', description: 'Bánh mỳ giòn ăn cùng trứng, pate và nước sốt nóng trong chảo — no lâu và rất bắt vị.' },
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
const signInButton = document.querySelector('#signInButton');
const signInLabel = document.querySelector('#signInLabel');
const userMenu = document.querySelector('#userMenu');
const userAvatar = document.querySelector('#userAvatar');
const userAvatarFallback = document.querySelector('#userAvatarFallback');
const userName = document.querySelector('#userName');
const membershipLabel = document.querySelector('#membershipLabel');
const signOutButton = document.querySelector('#signOutButton');
const appNotice = document.querySelector('#appNotice');
const communityFeed = document.querySelector('#communityFeed');
const feedStatus = document.querySelector('#feedStatus');
const feedStatusBadge = document.querySelector('#feedStatusBadge');
const dailyDecisionElement = document.querySelector('#dailyDecision');

const HISTORY_KEY = 'lunchdrop-history-v1';
const COUNT_KEY = 'lunchdrop-spin-count-v1';
const SCHEDULER_KEY = 'lunchdrop-scheduler-v1';
const SPIN_OUTBOX_KEY = 'lunchdrop-spin-outbox-v1';
const SCHEDULER_VERSION = 1;
const WEIGHT_SIGNATURE = foods.map((food) => `${food.id}:${food.weight}`).join('|');
const WINNER_INDEX = 48;
const FEED_LIMIT = 20;
const DAILY_TIME_ZONE = 'Asia/Ho_Chi_Minh';
const REALTIME_RETRY_DELAY = 5000;
const SPIN_SYNC_TIMEOUT = 10000;
const REACTION_OPTIONS = Object.freeze({
  eat: { emoji: '👍', label: 'Ăn món này' },
  reroll: { emoji: '🔄', label: 'Quay lại' },
  fire: { emoji: '🔥', label: 'Quá ngon' }
});
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const firebaseConfigured = ['apiKey', 'authDomain', 'projectId', 'appId'].every((key) => {
  const value = firebaseConfig?.[key];
  return typeof value === 'string' && value.trim() && !value.includes('YOUR_');
});

function createSchedulerState(lastFoodId = null) {
  return {
    currentById: Object.fromEntries(foods.map((food) => [food.id, 0])),
    lastFoodId: foods.some((food) => food.id === lastFoodId) ? lastFoodId : null
  };
}

function readSchedulerState(lastFoodId = null) {
  const fallback = createSchedulerState(lastFoodId);

  try {
    const saved = JSON.parse(localStorage.getItem(SCHEDULER_KEY) || 'null');
    if (saved?.version !== SCHEDULER_VERSION || saved.weightSignature !== WEIGHT_SIGNATURE) return fallback;

    const totalWeight = foods.reduce((sum, food) => sum + Math.max(0, food.weight), 0);
    const currentById = { ...fallback.currentById };
    foods.forEach((food) => {
      const score = Number(saved.currentById?.[food.id]);
      if (Number.isFinite(score)) currentById[food.id] = Math.max(-totalWeight, Math.min(totalWeight, score));
    });

    const savedLastFoodId = foods.some((food) => food.id === saved.lastFoodId) ? saved.lastFoodId : fallback.lastFoodId;
    return { currentById, lastFoodId: savedLastFoodId };
  } catch {
    return fallback;
  }
}

function saveSchedulerState() {
  try {
    localStorage.setItem(SCHEDULER_KEY, JSON.stringify({
      version: SCHEDULER_VERSION,
      weightSignature: WEIGHT_SIGNATURE,
      currentById: schedulerState.currentById,
      lastFoodId: schedulerState.lastFoodId
    }));
  } catch {
    // Keep scheduling in memory when storage is unavailable.
  }
}

let spinning = false;
let soundEnabled = true;
let audioContext = null;
let history = readHistory();
let spinCount = readSpinCount();
let spinOutbox = readSpinOutbox();
let schedulerState = readSchedulerState(history[0]?.foodId);
let lastResult = null;
let lastCompletedSpinId = null;
let spinOwner = null;
let spinDocumentId = null;
let auth = null;
let database = null;
let googleProvider = null;
let currentUser = null;
let memberDisplayName = '';
let authReady = false;
let authOperationPending = false;
let membershipState = 'idle';
let authStateSequence = 0;
let feedUnsubscribe = null;
let membershipUnsubscribe = null;
let dailyDecisionUnsubscribe = null;
let dailyDecisionRetryTimer = null;
let dailyDecisionSubscriptionVersion = 0;
let dailyDecisionDateKey = '';
let dailyDecision = null;
let dailyDecisionStatus = 'idle';
let decisionSaving = false;
let decisionSavingVersion = 0;
let latestFeedEntries = [];
let outboxFlushPromise = null;
let noticeTimer = null;
const spinSyncPromises = new Map();
const reactionStateBySpin = new Map();
const confirmedReactionBySpin = new Map();
const reactionUnsubscribes = new Map();
const reactionRetryTimers = new Map();
const reactionTerminalFailures = new Set();
const reactionMutationVersions = new Map();
let reactionSubscriptionVersion = 0;

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

function nextWeightedRoundRobin() {
  const activeFoods = foods.filter((food) => Number.isFinite(food.weight) && food.weight > 0);
  if (!activeFoods.length) return foods[0];

  const totalWeight = activeFoods.reduce((sum, food) => sum + food.weight, 0);
  activeFoods.forEach((food) => {
    schedulerState.currentById[food.id] = (schedulerState.currentById[food.id] || 0) + food.weight;
  });

  const alternatives = activeFoods.filter((food) => food.id !== schedulerState.lastFoodId);
  const selectableFoods = alternatives.length ? alternatives : activeFoods;
  let winner = selectableFoods[0];

  for (const food of selectableFoods.slice(1)) {
    if (schedulerState.currentById[food.id] > schedulerState.currentById[winner.id]) winner = food;
  }

  schedulerState.currentById[winner.id] -= totalWeight;
  schedulerState.lastFoodId = winner.id;
  saveSchedulerState();
  return winner;
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

function readSpinOutbox() {
  try {
    const saved = JSON.parse(localStorage.getItem(SPIN_OUTBOX_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((entry) => (
      typeof entry?.id === 'string'
      && typeof entry.uid === 'string'
      && foods.some((food) => food.id === entry.foodId)
    )).slice(-50);
  } catch {
    return [];
  }
}

function saveSpinOutbox() {
  try {
    localStorage.setItem(SPIN_OUTBOX_KEY, JSON.stringify(spinOutbox));
  } catch {
    // Keep pending shared spins in memory when storage is unavailable.
  }
}

function queueSharedSpin(food, owner, documentId) {
  if (!owner?.uid || !documentId) return;
  if (!spinOutbox.some((entry) => entry.id === documentId)) {
    spinOutbox.push({ id: documentId, uid: owner.uid, foodId: food.id });
    spinOutbox = spinOutbox.slice(-50);
    saveSpinOutbox();
  }
  void flushSpinOutbox();
}

function removeFromSpinOutbox(documentId) {
  spinOutbox = spinOutbox.filter((entry) => entry.id !== documentId);
  saveSpinOutbox();
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

function getDisplayName(user) {
  const name = typeof user?.displayName === 'string' ? user.displayName.trim() : '';
  const emailName = typeof user?.email === 'string' ? user.email.split('@')[0] : '';
  return (name || emailName || 'Thành viên').slice(0, 80);
}

function getInitials(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const selected = parts.length === 1 ? parts : [parts[0], parts[parts.length - 1]];
  return selected.map((part) => Array.from(part)[0] || '').join('').toUpperCase().slice(0, 2);
}

function setFeedStatus(label, state = 'offline') {
  feedStatus.textContent = label;
  feedStatusBadge.dataset.state = state;
}

function renderFeedMessage(message, kind = 'empty') {
  const empty = document.createElement('div');
  empty.className = 'feed-empty';
  empty.dataset.kind = kind;
  empty.textContent = message;
  communityFeed.replaceChildren(empty);
  communityFeed.setAttribute('aria-busy', kind === 'loading' ? 'true' : 'false');
}

function formatFeedTime(value) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : value instanceof Date ? value : null;
  if (!date || Number.isNaN(date.getTime())) return 'VỪA XONG';

  const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const today = new Date();
  const isToday = date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
  if (isToday) return `HÔM NAY · ${time}`;

  const day = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  return `${day} · ${time}`;
}

function getTodayKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DAILY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return values.year && values.month && values.day
    ? `${values.year}-${values.month}-${values.day}`
    : date.toISOString().slice(0, 10);
}

function formatDecisionTime(value) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('vi-VN', {
    timeZone: DAILY_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getReactionSummary(spinId) {
  const counts = Object.fromEntries(Object.keys(REACTION_OPTIONS).map((type) => [type, 0]));
  const reactions = reactionStateBySpin.get(spinId) || new Map();
  reactions.forEach((type) => {
    if (Object.hasOwn(counts, type)) counts[type] += 1;
  });
  return {
    counts,
    mine: currentUser ? reactions.get(currentUser.uid) || null : null
  };
}

function getDecisionButtonLabel(entry, isSelected) {
  if (isSelected) return '✓ MÓN HÔM NAY';
  if (entry?.pending) return 'ĐANG LƯU...';
  if (decisionSaving) return 'ĐANG CHỐT...';
  if (dailyDecisionStatus === 'loading') return 'ĐANG KIỂM TRA...';
  if (dailyDecisionStatus === 'error') return 'KHÔNG THỂ CHỐT';
  return 'CHỐT HÔM NAY';
}

function updateAcceptResultButton() {
  const hasResult = Boolean(lastCompletedSpinId && lastResult?.id);
  const canFinalize = hasResult
    && membershipState === 'allowed'
    && dailyDecisionStatus === 'ready'
    && !dailyDecision
    && !decisionSaving;
  acceptResultButton.disabled = !canFinalize;

  if (dailyDecision || dailyDecisionStatus === 'selected') {
    acceptResultButton.textContent = 'NHÓM ĐÃ CHỐT MÓN HÔM NAY';
  } else if (decisionSaving) {
    acceptResultButton.textContent = 'ĐANG CHỐT MÓN...';
  } else if (dailyDecisionStatus === 'loading') {
    acceptResultButton.textContent = 'ĐANG KIỂM TRA QUYẾT ĐỊNH...';
  } else if (dailyDecisionStatus === 'error') {
    acceptResultButton.textContent = 'CHƯA THỂ CHỐT LÚC NÀY';
  } else if (membershipState !== 'allowed') {
    acceptResultButton.textContent = 'ĐĂNG NHẬP ĐỂ CHỐT';
  } else {
    acceptResultButton.textContent = 'CHỐT MÓN NÀY';
  }
}

function renderDailyDecision() {
  if (!dailyDecisionElement) return;

  const icon = document.createElement('div');
  icon.className = 'daily-decision-icon';
  const copy = document.createElement('div');
  copy.className = 'daily-decision-copy';
  const label = document.createElement('small');
  label.textContent = 'MÓN ĐÃ CHỐT HÔM NAY';
  const title = document.createElement('strong');
  const meta = document.createElement('span');
  copy.append(label, title, meta);

  if (dailyDecision) {
    const food = foods.find((item) => item.id === dailyDecision.foodId);
    const eatVotes = getReactionSummary(dailyDecision.spinId).counts.eat;
    dailyDecisionElement.dataset.state = 'selected';
    icon.textContent = food?.emoji || '◆';
    title.textContent = food?.name || 'Món đã chốt';
    const time = formatDecisionTime(dailyDecision.createdAt);
    const details = [`Bởi ${dailyDecision.chosenByName || 'một thành viên'}`];
    if (time) details.push(time);
    if (eatVotes > 0) details.push(`${eatVotes} phiếu muốn ăn`);
    meta.textContent = details.join(' · ');

    const badge = document.createElement('span');
    badge.className = 'daily-decision-badge';
    badge.textContent = 'ĐÃ CHỐT';
    dailyDecisionElement.replaceChildren(icon, copy, badge);
    updateAcceptResultButton();
    return;
  }

  icon.textContent = decisionSaving || dailyDecisionStatus === 'loading' ? '…' : '◇';
  if (decisionSaving) {
    dailyDecisionElement.dataset.state = 'saving';
    title.textContent = 'Đang chốt món...';
    meta.textContent = 'Đang xác nhận với Firestore.';
  } else if (membershipState !== 'allowed') {
    dailyDecisionElement.dataset.state = 'locked';
    title.textContent = 'Đăng nhập để xem quyết định hôm nay';
    meta.textContent = 'Chỉ thành viên trong nhóm mới có quyền truy cập.';
  } else if (dailyDecisionStatus === 'loading') {
    dailyDecisionElement.dataset.state = 'loading';
    title.textContent = 'Đang kiểm tra món hôm nay...';
    meta.textContent = 'Nút chốt sẽ mở sau khi Firestore phản hồi.';
  } else if (dailyDecisionStatus === 'error') {
    dailyDecisionElement.dataset.state = 'error';
    icon.textContent = '!';
    title.textContent = 'Chưa thể tải quyết định hôm nay';
    meta.textContent = 'Ứng dụng sẽ tự kết nối lại sau ít giây.';
  } else {
    dailyDecisionElement.dataset.state = 'empty';
    title.textContent = 'Chưa có món nào được chốt';
    meta.textContent = 'Bình chọn rồi chọn một Live Drop bên dưới.';
  }
  dailyDecisionElement.replaceChildren(icon, copy);
  updateAcceptResultButton();
}

function createReactionButton(spinId, type, isPending) {
  const option = REACTION_OPTIONS[type];
  const summary = getReactionSummary(spinId);
  const button = document.createElement('button');
  button.className = 'reaction-button';
  button.type = 'button';
  button.dataset.spinId = spinId;
  button.dataset.reaction = type;
  button.disabled = isPending || membershipState !== 'allowed';
  button.setAttribute('aria-pressed', String(summary.mine === type));
  button.setAttribute('aria-label', `${option.label}: ${summary.counts[type]} lượt`);

  const emoji = document.createElement('span');
  emoji.className = 'reaction-emoji';
  emoji.textContent = option.emoji;
  emoji.setAttribute('aria-hidden', 'true');
  const text = document.createElement('span');
  text.className = 'reaction-label';
  text.textContent = option.label;
  const count = document.createElement('span');
  count.className = 'reaction-count';
  count.textContent = String(summary.counts[type]);
  button.append(emoji, text, count);
  return button;
}

function createFeedActions(entry) {
  const actions = document.createElement('div');
  actions.className = 'feed-actions';
  const reactions = document.createElement('div');
  reactions.className = 'reaction-group';
  Object.keys(REACTION_OPTIONS).forEach((type) => {
    reactions.append(createReactionButton(entry.id, type, entry.pending));
  });

  const decisionButton = document.createElement('button');
  decisionButton.className = 'decision-button';
  decisionButton.type = 'button';
  decisionButton.dataset.spinId = entry.id;
  decisionButton.dataset.foodId = entry.foodId;
  const isSelected = dailyDecision?.spinId === entry.id;
  decisionButton.hidden = Boolean(dailyDecision) && !isSelected;
  decisionButton.disabled = decisionSaving
    || entry.pending
    || Boolean(dailyDecision)
    || dailyDecisionStatus !== 'ready'
    || membershipState !== 'allowed';
  decisionButton.textContent = getDecisionButtonLabel(entry, isSelected);
  if (isSelected) decisionButton.classList.add('is-selected');

  actions.append(reactions, decisionButton);
  return actions;
}

function findFeedItem(spinId) {
  return Array.from(communityFeed.querySelectorAll('.feed-item'))
    .find((item) => item.dataset.spinId === spinId) || null;
}

function updateReactionControls(spinId) {
  const item = findFeedItem(spinId);
  const summary = getReactionSummary(spinId);
  if (item) {
    item.querySelectorAll('.reaction-button').forEach((button) => {
      const type = button.dataset.reaction;
      const count = summary.counts[type] || 0;
      button.querySelector('.reaction-count').textContent = String(count);
      button.setAttribute('aria-pressed', String(summary.mine === type));
      button.setAttribute('aria-label', `${REACTION_OPTIONS[type].label}: ${count} lượt`);
    });
  }
  if (dailyDecision?.spinId === spinId) renderDailyDecision();
}

function updateDecisionControls() {
  communityFeed.querySelectorAll('.decision-button').forEach((button) => {
    const entry = latestFeedEntries.find((item) => item.id === button.dataset.spinId);
    const isSelected = dailyDecision?.spinId === button.dataset.spinId;
    button.hidden = Boolean(dailyDecision) && !isSelected;
    button.disabled = decisionSaving
      || Boolean(dailyDecision)
      || dailyDecisionStatus !== 'ready'
      || Boolean(entry?.pending)
      || membershipState !== 'allowed';
    button.textContent = getDecisionButtonLabel(entry, isSelected);
    button.classList.toggle('is-selected', isSelected);
  });
  renderDailyDecision();
}

function renderCommunityFeed(entries) {
  if (!entries.length) {
    renderFeedMessage('Chưa có kết quả nào. Hãy là người đầu tiên mở hòm cho cả nhóm xem.');
    return;
  }

  const previousFirstId = communityFeed.querySelector('.feed-item')?.dataset.spinId || null;
  const previousScrollTop = communityFeed.scrollTop;
  const fragment = document.createDocumentFragment();
  entries.forEach((entry) => {
    const food = foods.find((item) => item.id === entry.foodId);
    if (!food) return;

    const item = document.createElement('article');
    item.className = 'feed-item';
    item.dataset.rarity = food.rarity;
    item.dataset.spinId = entry.id;
    if (entry.pending) item.classList.add('is-pending');

    const authorName = typeof entry.authorName === 'string' && entry.authorName.trim()
      ? entry.authorName.trim().slice(0, 80)
      : 'Một thành viên';
    const avatar = document.createElement('div');
    avatar.className = 'feed-avatar';
    avatar.textContent = getInitials(authorName);
    avatar.setAttribute('aria-hidden', 'true');

    const copy = document.createElement('div');
    copy.className = 'feed-copy';
    const event = document.createElement('p');
    event.className = 'feed-event';
    const author = document.createElement('strong');
    author.textContent = authorName;
    const meal = document.createElement('b');
    meal.textContent = food.name;
    event.append(author, document.createTextNode(' vừa quay ra '), meal);

    const meta = document.createElement('span');
    meta.className = 'feed-meta';
    const timeLabel = entry.pending ? 'ĐANG ĐỒNG BỘ' : formatFeedTime(entry.createdAt);
    meta.textContent = `${rarityInfo[food.rarity].label.toUpperCase()} · ${timeLabel}`;
    copy.append(event, meta);

    const emoji = document.createElement('div');
    emoji.className = 'feed-food-emoji';
    emoji.textContent = food.emoji;
    emoji.setAttribute('aria-hidden', 'true');

    item.append(avatar, copy, emoji, createFeedActions(entry));
    fragment.append(item);
  });

  if (!fragment.childNodes.length) {
    renderFeedMessage('Không có kết quả hợp lệ để hiển thị.');
    return;
  }

  communityFeed.replaceChildren(fragment);
  communityFeed.setAttribute('aria-busy', 'false');
  const nextFirstId = communityFeed.querySelector('.feed-item')?.dataset.spinId || null;
  communityFeed.scrollTop = previousFirstId && previousFirstId === nextFirstId ? previousScrollTop : 0;
}

function showNotice(message, tone = 'info', duration = 6000) {
  window.clearTimeout(noticeTimer);
  appNotice.textContent = message;
  appNotice.dataset.tone = tone;
  appNotice.hidden = false;
  if (duration > 0) {
    noticeTimer = window.setTimeout(() => {
      appNotice.hidden = true;
    }, duration);
  }
}

function renderAuthControls() {
  const signedIn = Boolean(currentUser);
  signInButton.hidden = signedIn;
  userMenu.hidden = !signedIn;

  if (!signedIn) {
    signInButton.disabled = authOperationPending || !firebaseConfigured;
    signInLabel.innerHTML = authOperationPending
      ? 'ĐANG MỞ GOOGLE...'
      : 'ĐĂNG NHẬP <span class="wide-label">GOOGLE</span>';
    return;
  }

  const displayName = memberDisplayName || getDisplayName(currentUser);
  userName.textContent = displayName;
  userAvatarFallback.textContent = getInitials(displayName);
  const photoUrl = typeof currentUser.photoURL === 'string' && currentUser.photoURL.startsWith('https://')
    ? currentUser.photoURL
    : '';
  userAvatar.hidden = !photoUrl;
  userAvatarFallback.hidden = Boolean(photoUrl);
  if (photoUrl) userAvatar.src = photoUrl;

  const membershipLabels = {
    checking: 'ĐANG KIỂM TRA',
    allowed: 'THÀNH VIÊN',
    denied: 'CHƯA ĐƯỢC DUYỆT',
    error: 'LỖI KẾT NỐI'
  };
  membershipLabel.textContent = membershipLabels[membershipState] || 'ĐÃ ĐĂNG NHẬP';
  userMenu.dataset.membership = membershipState;
  signOutButton.disabled = spinning || authOperationPending;
}

function renderSpinButton() {
  let state = 'ready';
  let title = 'MỞ HÒM NGAY';
  let subtitle = 'MIỄN PHÍ · KHÔNG HỐI HẬN';

  if (spinning) {
    state = 'spinning';
    title = 'ĐANG MỞ HÒM...';
    subtitle = 'VẬN MAY ĐANG CHẠY';
  } else if (!firebaseConfigured) {
    state = 'configuration';
    title = 'CHƯA CẤU HÌNH FIREBASE';
    subtitle = 'XEM HƯỚNG DẪN TRONG README';
  } else if (!authReady) {
    state = 'connecting';
    title = 'ĐANG KẾT NỐI...';
    subtitle = 'VUI LÒNG CHỜ MỘT CHÚT';
  } else if (!currentUser) {
    state = 'auth-required';
    title = 'ĐĂNG NHẬP ĐỂ QUAY';
    subtitle = 'DÙNG NÚT GOOGLE PHÍA TRÊN';
  } else if (membershipState === 'checking') {
    state = 'checking';
    title = 'ĐANG KIỂM TRA THÀNH VIÊN';
    subtitle = 'VUI LÒNG CHỜ MỘT CHÚT';
  } else if (membershipState === 'denied') {
    state = 'denied';
    title = 'TÀI KHOẢN CHƯA ĐƯỢC DUYỆT';
    subtitle = 'LIÊN HỆ QUẢN TRỊ NHÓM';
  } else if (membershipState !== 'allowed') {
    state = 'error';
    title = 'KHÔNG THỂ KẾT NỐI';
    subtitle = 'THỬ ĐĂNG XUẤT VÀO LẠI';
  }

  openButton.dataset.state = state;
  openButton.disabled = state !== 'ready';
  openButton.querySelector('.button-copy b').textContent = title;
  openButton.querySelector('.button-copy small').textContent = subtitle;
  renderAuthControls();
}

function stopReactionSubscriptions() {
  reactionSubscriptionVersion += 1;
  reactionUnsubscribes.forEach((unsubscribe) => unsubscribe());
  reactionRetryTimers.forEach((timerId) => window.clearTimeout(timerId));
  reactionUnsubscribes.clear();
  reactionRetryTimers.clear();
  reactionTerminalFailures.clear();
  reactionStateBySpin.clear();
  confirmedReactionBySpin.clear();
  reactionMutationVersions.clear();
}

function stopFeed() {
  if (feedUnsubscribe) feedUnsubscribe();
  feedUnsubscribe = null;
  latestFeedEntries = [];
  stopReactionSubscriptions();
}

function stopDailyDecision(cancelPending = true) {
  if (dailyDecisionUnsubscribe) dailyDecisionUnsubscribe();
  if (dailyDecisionRetryTimer) window.clearTimeout(dailyDecisionRetryTimer);
  dailyDecisionUnsubscribe = null;
  dailyDecisionRetryTimer = null;
  dailyDecisionSubscriptionVersion += 1;
  dailyDecisionDateKey = '';
  dailyDecision = null;
  dailyDecisionStatus = 'idle';
  if (cancelPending) {
    decisionSaving = false;
    decisionSavingVersion += 1;
  }
  renderDailyDecision();
}

function stopMembership() {
  if (membershipUnsubscribe) membershipUnsubscribe();
  membershipUnsubscribe = null;
}

function syncReactionSubscriptions(entries = latestFeedEntries) {
  if (!database || membershipState !== 'allowed') return;

  const wantedIds = new Set(entries.map((entry) => entry.id).filter(Boolean));
  if (dailyDecision?.spinId) wantedIds.add(dailyDecision.spinId);

  reactionUnsubscribes.forEach((unsubscribe, spinId) => {
    if (wantedIds.has(spinId)) return;
    unsubscribe();
    reactionUnsubscribes.delete(spinId);
    const retryTimer = reactionRetryTimers.get(spinId);
    if (retryTimer) window.clearTimeout(retryTimer);
    reactionRetryTimers.delete(spinId);
    reactionTerminalFailures.delete(spinId);
    reactionStateBySpin.delete(spinId);
    confirmedReactionBySpin.delete(spinId);
  });
  reactionRetryTimers.forEach((timerId, spinId) => {
    if (wantedIds.has(spinId)) return;
    window.clearTimeout(timerId);
    reactionRetryTimers.delete(spinId);
    reactionStateBySpin.delete(spinId);
    confirmedReactionBySpin.delete(spinId);
    reactionMutationVersions.delete(spinId);
  });
  reactionTerminalFailures.forEach((spinId) => {
    if (wantedIds.has(spinId)) return;
    reactionTerminalFailures.delete(spinId);
    reactionStateBySpin.delete(spinId);
    confirmedReactionBySpin.delete(spinId);
    reactionMutationVersions.delete(spinId);
  });

  wantedIds.forEach((spinId) => {
    if (
      reactionUnsubscribes.has(spinId)
      || reactionRetryTimers.has(spinId)
      || reactionTerminalFailures.has(spinId)
    ) return;
    const subscriptionAuthSequence = authStateSequence;
    const subscriptionVersion = reactionSubscriptionVersion;
    let unsubscribe = null;
    unsubscribe = onSnapshot(
      collection(database, 'spins', spinId, 'reactions'),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (
          subscriptionVersion !== reactionSubscriptionVersion
          || subscriptionAuthSequence !== authStateSequence
          || reactionUnsubscribes.get(spinId) !== unsubscribe
        ) return;

        const reactions = new Map();
        snapshot.docs.forEach((reactionDocument) => {
          const data = reactionDocument.data();
          if (Object.hasOwn(REACTION_OPTIONS, data.type)) reactions.set(reactionDocument.id, data.type);
        });
        reactionStateBySpin.set(spinId, reactions);

        const currentUid = currentUser?.uid;
        const ownDocument = currentUid
          ? snapshot.docs.find((reactionDocument) => reactionDocument.id === currentUid)
          : null;
        if (currentUid) {
          if (ownDocument && !ownDocument.metadata.hasPendingWrites) {
            const confirmedType = ownDocument.data().type;
            confirmedReactionBySpin.set(
              spinId,
              Object.hasOwn(REACTION_OPTIONS, confirmedType) ? confirmedType : null
            );
          } else if (!ownDocument && !snapshot.metadata.hasPendingWrites) {
            confirmedReactionBySpin.set(spinId, null);
          }
        }
        updateReactionControls(spinId);
      },
      (error) => {
        if (
          subscriptionVersion !== reactionSubscriptionVersion
          || subscriptionAuthSequence !== authStateSequence
          || reactionUnsubscribes.get(spinId) !== unsubscribe
        ) return;

        reactionUnsubscribes.delete(spinId);
        console.error(`Cannot subscribe to reactions for ${spinId}:`, error);
        if (['permission-denied', 'unauthenticated', 'failed-precondition', 'invalid-argument'].includes(error?.code)) {
          reactionTerminalFailures.add(spinId);
          return;
        }

        const retryTimer = window.setTimeout(() => {
          reactionRetryTimers.delete(spinId);
          if (
            subscriptionVersion === reactionSubscriptionVersion
            && subscriptionAuthSequence === authStateSequence
            && membershipState === 'allowed'
          ) {
            syncReactionSubscriptions();
          }
        }, REALTIME_RETRY_DELAY);
        reactionRetryTimers.set(spinId, retryTimer);
      }
    );
    reactionUnsubscribes.set(spinId, unsubscribe);
  });
}

function subscribeToDailyDecision() {
  stopDailyDecision(false);
  const subscribedDateKey = getTodayKey();
  const subscriptionVersion = dailyDecisionSubscriptionVersion;
  dailyDecisionDateKey = subscribedDateKey;
  dailyDecisionStatus = 'loading';
  renderDailyDecision();

  dailyDecisionUnsubscribe = onSnapshot(
    doc(database, 'dailyDecisions', subscribedDateKey),
    { includeMetadataChanges: true },
    (snapshot) => {
      if (subscriptionVersion !== dailyDecisionSubscriptionVersion) return;
      dailyDecision = snapshot.exists()
        ? { id: snapshot.id, ...snapshot.data({ serverTimestamps: 'estimate' }) }
        : null;
      dailyDecisionStatus = dailyDecision ? 'selected' : 'ready';
      updateDecisionControls();
      syncReactionSubscriptions();
    },
    (error) => {
      if (subscriptionVersion !== dailyDecisionSubscriptionVersion) return;
      console.error('Cannot subscribe to daily decision:', error);
      dailyDecisionUnsubscribe = null;
      dailyDecision = null;
      dailyDecisionStatus = 'error';
      updateDecisionControls();
      dailyDecisionRetryTimer = window.setTimeout(() => {
        dailyDecisionRetryTimer = null;
        if (
          membershipState === 'allowed'
          && dailyDecisionDateKey === subscribedDateKey
          && getTodayKey() === subscribedDateKey
          && !dailyDecisionUnsubscribe
        ) {
          subscribeToDailyDecision();
        }
      }, REALTIME_RETRY_DELAY);
    }
  );
}

function subscribeToFeed() {
  stopFeed();
  setFeedStatus('ĐANG KẾT NỐI', 'loading');
  renderFeedMessage('Đang tải kết quả mới nhất của cả nhóm...', 'loading');

  const feedQuery = query(
    collection(database, 'spins'),
    orderBy('createdAt', 'desc'),
    limit(FEED_LIMIT)
  );

  feedUnsubscribe = onSnapshot(
    feedQuery,
    { includeMetadataChanges: true },
    (snapshot) => {
      latestFeedEntries = snapshot.docs.map((item) => ({
        ...item.data({ serverTimestamps: 'estimate' }),
        id: item.id,
        pending: item.metadata.hasPendingWrites
      }));
      const statusState = snapshot.metadata.fromCache ? 'loading' : 'online';
      const statusLabel = snapshot.metadata.fromCache
        ? `${snapshot.size} KẾT QUẢ · OFFLINE`
        : `${snapshot.size} KẾT QUẢ GẦN NHẤT`;
      setFeedStatus(statusLabel, statusState);
      renderCommunityFeed(latestFeedEntries);
      syncReactionSubscriptions();
    },
    (error) => {
      console.error('Cannot subscribe to shared spins:', error);
      latestFeedEntries = [];
      stopReactionSubscriptions();
      setFeedStatus('LỖI REALTIME', 'error');
      renderFeedMessage('Không thể tải feed chung. Hãy kiểm tra Firestore Rules và kết nối mạng.', 'error');
    }
  );
}

async function toggleReaction(spinId, type) {
  if (!database || !currentUser || membershipState !== 'allowed' || !Object.hasOwn(REACTION_OPTIONS, type)) return;
  const entry = latestFeedEntries.find((item) => item.id === spinId);
  if (entry?.pending) {
    showNotice('Hãy chờ kết quả được đồng bộ trước khi thả reaction.', 'warning');
    return;
  }

  const actorUid = currentUser.uid;
  const actorAuthSequence = authStateSequence;
  const reactions = new Map(reactionStateBySpin.get(spinId) || []);
  const previousType = reactions.get(actorUid) || null;
  const nextType = previousType === type ? null : type;
  if (nextType) reactions.set(actorUid, nextType);
  else reactions.delete(actorUid);
  reactionStateBySpin.set(spinId, reactions);
  updateReactionControls(spinId);

  const mutation = { actorUid, actorAuthSequence };
  reactionMutationVersions.set(spinId, mutation);
  const reactionReference = doc(database, 'spins', spinId, 'reactions', actorUid);

  try {
    if (nextType) {
      await setDoc(reactionReference, {
        uid: actorUid,
        type: nextType,
        updatedAt: serverTimestamp()
      });
    } else {
      await deleteDoc(reactionReference);
    }
    if (reactionMutationVersions.get(spinId) === mutation) {
      reactionMutationVersions.delete(spinId);
    }
  } catch (error) {
    console.error('Cannot update reaction:', error);
    if (reactionMutationVersions.get(spinId) !== mutation) return;

    reactionMutationVersions.delete(spinId);
    if (actorAuthSequence !== authStateSequence || currentUser?.uid !== actorUid) return;

    const rollback = new Map(reactionStateBySpin.get(spinId) || []);
    const confirmedType = confirmedReactionBySpin.get(spinId) || null;
    if (confirmedType) rollback.set(actorUid, confirmedType);
    else rollback.delete(actorUid);
    reactionStateBySpin.set(spinId, rollback);
    updateReactionControls(spinId);
    showNotice('Không thể cập nhật reaction. Hãy kiểm tra kết nối rồi thử lại.', 'error');
  }
}

async function finalizeDailyDecision(spinId, foodId = null) {
  if (!database || !currentUser || membershipState !== 'allowed' || decisionSaving) return;

  const requestedDateKey = getTodayKey();
  if (dailyDecisionDateKey !== requestedDateKey) {
    subscribeToDailyDecision();
    showNotice('Đang kiểm tra quyết định của ngày mới. Hãy thử lại sau ít giây.', 'warning');
    return;
  }
  if (dailyDecision) {
    showNotice('Nhóm đã chốt món cho hôm nay rồi.', 'warning');
    return;
  }
  if (dailyDecisionStatus === 'loading') {
    showNotice('Đang kiểm tra món hôm nay với Firestore.', 'warning');
    return;
  }
  if (dailyDecisionStatus === 'error') {
    showNotice('Chưa thể xác nhận món hôm nay. Ứng dụng đang kết nối lại.', 'error');
    return;
  }
  if (dailyDecisionStatus !== 'ready') return;

  const entry = latestFeedEntries.find((item) => item.id === spinId);
  const selectedFoodId = foodId || entry?.foodId;
  const food = foods.find((item) => item.id === selectedFoodId);
  if (!spinId || !food) {
    showNotice('Không tìm thấy kết quả để chốt.', 'error');
    return;
  }

  const actorUid = currentUser.uid;
  const actorName = memberDisplayName;
  const authSequence = authStateSequence;
  const operationVersion = ++decisionSavingVersion;
  decisionSaving = true;
  updateDecisionControls();

  try {
    await ensureSpinSyncedForDecision(spinId, actorUid, actorName);
    if (
      authSequence !== authStateSequence
      || currentUser?.uid !== actorUid
      || membershipState !== 'allowed'
      || memberDisplayName !== actorName
    ) {
      const error = new Error('Authentication changed while saving daily decision');
      error.code = 'decision/auth-changed';
      throw error;
    }
    if (getTodayKey() !== requestedDateKey) {
      const error = new Error('Date changed while saving daily decision');
      error.code = 'decision/date-changed';
      throw error;
    }

    await runTransaction(database, async (transaction) => {
      if (getTodayKey() !== requestedDateKey) {
        const error = new Error('Date changed before transaction read');
        error.code = 'decision/date-changed';
        throw error;
      }

      const decisionReference = doc(database, 'dailyDecisions', requestedDateKey);
      const spinReference = doc(database, 'spins', spinId);
      const existingDecision = await transaction.get(decisionReference);
      if (existingDecision.exists()) {
        const error = new Error('Daily decision already exists');
        error.code = 'decision/already-exists';
        throw error;
      }

      const spinSnapshot = await transaction.get(spinReference);
      if (!spinSnapshot.exists() || spinSnapshot.data().foodId !== food.id) {
        const error = new Error('Spin is not available');
        error.code = 'decision/spin-unavailable';
        throw error;
      }
      if (getTodayKey() !== requestedDateKey) {
        const error = new Error('Date changed before transaction write');
        error.code = 'decision/date-changed';
        throw error;
      }

      transaction.set(decisionReference, {
        dateKey: requestedDateKey,
        spinId,
        foodId: food.id,
        chosenByUid: actorUid,
        chosenByName: actorName,
        createdAt: serverTimestamp()
      });
    });

    if (decisionSavingVersion !== operationVersion) return;
    const dayChangedAfterCommit = getTodayKey() !== requestedDateKey;
    if (!dayChangedAfterCommit && dailyDecisionDateKey === requestedDateKey && !dailyDecision) {
      dailyDecision = {
        id: requestedDateKey,
        dateKey: requestedDateKey,
        spinId,
        foodId: food.id,
        chosenByUid: actorUid,
        chosenByName: actorName,
        createdAt: null
      };
      dailyDecisionStatus = 'selected';
    }

    if (dayChangedAfterCommit) {
      subscribeToDailyDecision();
      statusText.textContent = `${food.name} đã được chốt cho ngày ${requestedDateKey}.`;
      showNotice(`Đã chốt ${food.name} cho ngày ${requestedDateKey}; ngày mới vừa bắt đầu.`, 'warning');
    } else {
      statusText.textContent = `${food.name} đã được chốt cho bữa trưa hôm nay!`;
      showNotice(`Đã chốt ${food.name} cho cả nhóm.`, 'success');
    }
  } catch (error) {
    console.error('Cannot finalize daily decision:', error);
    if (decisionSavingVersion !== operationVersion) return;

    if (error?.code === 'decision/already-exists') {
      subscribeToDailyDecision();
      showNotice('Một thành viên khác vừa chốt món hôm nay.', 'warning');
    } else if (error?.code === 'decision/spin-unavailable') {
      showNotice('Kết quả này chưa đồng bộ xong. Hãy thử lại sau ít giây.', 'warning');
    } else if (error?.code === 'decision/spin-sync-timeout') {
      showNotice('Kết quả chưa lên máy chủ. App sẽ tiếp tục đồng bộ khi có mạng.', 'warning');
    } else if (error?.code === 'decision/date-changed') {
      subscribeToDailyDecision();
      showNotice('Ngày mới vừa bắt đầu. Hãy chọn lại món cho hôm nay.', 'warning');
    } else if (error?.code === 'decision/auth-changed') {
      showNotice('Phiên đăng nhập đã thay đổi. Hãy thử chốt lại.', 'warning');
    } else {
      showNotice('Không thể chốt món hôm nay. Hãy kiểm tra kết nối và Firestore Rules.', 'error');
    }
  } finally {
    if (decisionSavingVersion === operationVersion) {
      decisionSaving = false;
      updateDecisionControls();
    }
  }
}

function applyAuthState(user) {
  const sequence = ++authStateSequence;
  stopFeed();
  stopDailyDecision();
  stopMembership();
  currentUser = user;
  memberDisplayName = '';
  membershipState = user ? 'checking' : 'idle';
  authReady = true;
  renderDailyDecision();
  renderSpinButton();

  if (!user) {
    setFeedStatus('CẦN ĐĂNG NHẬP', 'offline');
    renderFeedMessage('Đăng nhập bằng tài khoản Google đã được duyệt để xem kết quả của cả nhóm.');
    statusText.textContent = 'Đăng nhập bằng Google để mở hòm cùng mọi người.';
    return;
  }

  const email = typeof user.email === 'string' ? user.email : '';
  if (!email) {
    membershipState = 'denied';
    renderSpinButton();
    setFeedStatus('KHÔNG CÓ EMAIL', 'blocked');
    renderFeedMessage('Tài khoản Google này không cung cấp email đã xác minh.', 'blocked');
    return;
  }

  setFeedStatus('ĐANG KIỂM TRA', 'loading');
  renderFeedMessage(`Đang kiểm tra quyền của ${email}...`, 'loading');

  membershipUnsubscribe = onSnapshot(
    doc(database, 'allowedUsers', email),
    { includeMetadataChanges: true },
    (membership) => {
      if (sequence !== authStateSequence) return;
      if (membership.metadata.fromCache) {
        memberDisplayName = '';
        membershipState = 'checking';
        stopFeed();
        stopDailyDecision();
        renderSpinButton();
        setFeedStatus('ĐANG XÁC MINH', 'loading');
        renderFeedMessage('Đang xác minh quyền thành viên với máy chủ...', 'loading');
        return;
      }

      const memberData = membership.exists() ? membership.data() : null;
      const configuredName = typeof memberData?.displayName === 'string'
        ? memberData.displayName.trim().slice(0, 80)
        : '';

      if (!membership.exists() || memberData?.active !== true) {
        memberDisplayName = '';
        membershipState = 'denied';
        stopFeed();
        stopDailyDecision();
        renderSpinButton();
        setFeedStatus('CHƯA ĐƯỢC DUYỆT', 'blocked');
        renderFeedMessage(`Email ${email} chưa được kích hoạt trong allowedUsers.`, 'blocked');
        statusText.textContent = 'Tài khoản chưa được quản trị viên cho phép quay.';
        return;
      }

      if (!configuredName) {
        memberDisplayName = '';
        membershipState = 'error';
        stopFeed();
        stopDailyDecision();
        renderSpinButton();
        setFeedStatus('THIẾU TÊN THÀNH VIÊN', 'error');
        renderFeedMessage(`Document allowedUsers/${email} cần field displayName.`, 'error');
        return;
      }

      const wasAllowed = membershipState === 'allowed';
      memberDisplayName = configuredName;
      membershipState = 'allowed';
      renderSpinButton();
      statusText.textContent = `Xin chào ${memberDisplayName}! Hòm trưa đã sẵn sàng.`;
      if (!wasAllowed) {
        subscribeToDailyDecision();
        subscribeToFeed();
      }
      void flushSpinOutbox();
    },
    (error) => {
      if (sequence !== authStateSequence) return;
      console.error('Cannot watch membership:', error);
      memberDisplayName = '';
      membershipState = 'error';
      stopFeed();
      stopDailyDecision();
      renderSpinButton();
      setFeedStatus('LỖI PHÂN QUYỀN', 'error');
      renderFeedMessage('Không thể kiểm tra thành viên. Hãy chắc chắn Firestore đã được tạo và firestore.rules đã được publish.', 'error');
    }
  );
}

function friendlyAuthError(error) {
  const messages = {
    'auth/popup-blocked': 'Trình duyệt đã chặn cửa sổ đăng nhập Google. Hãy cho phép popup rồi thử lại.',
    'auth/unauthorized-domain': 'Domain này chưa nằm trong Firebase Authentication > Authorized domains.',
    'auth/network-request-failed': 'Không thể kết nối Google. Hãy kiểm tra mạng rồi thử lại.',
    'auth/operation-not-allowed': 'Google Sign-In chưa được bật trong Firebase Authentication.'
  };
  return messages[error?.code] || 'Không thể đăng nhập Google. Hãy kiểm tra cấu hình Firebase rồi thử lại.';
}

async function signInWithGoogle() {
  if (!auth || !googleProvider) {
    showNotice('Firebase chưa được cấu hình. Hãy cập nhật firebase-config.js trước.', 'warning');
    return;
  }
  if (window.location.protocol === 'file:') {
    showNotice('Google Login không chạy qua file://. Hãy mở app bằng local HTTP server.', 'warning');
    return;
  }

  authOperationPending = true;
  renderAuthControls();
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
      console.error('Google sign-in failed:', error);
      showNotice(friendlyAuthError(error), 'error');
    }
  } finally {
    authOperationPending = false;
    renderAuthControls();
  }
}

async function signOutUser() {
  if (!auth || spinning) return;
  authOperationPending = true;
  renderAuthControls();
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out failed:', error);
    showNotice('Không thể đăng xuất lúc này. Hãy thử lại.', 'error');
  } finally {
    authOperationPending = false;
    renderAuthControls();
  }
}

function initializeFirebaseServices() {
  if (!firebaseConfigured) {
    authReady = true;
    membershipState = 'configuration';
    renderSpinButton();
    setFeedStatus('CHƯA CẤU HÌNH', 'error');
    renderFeedMessage('Hãy điền Firebase Web config trong firebase-config.js để bật đăng nhập và feed chung.', 'error');
    statusText.textContent = 'Firebase chưa được cấu hình. Xem các bước thiết lập trong README.md.';
    showNotice('Cần điền Firebase Web config trong firebase-config.js trước khi dùng đăng nhập và feed chung.', 'warning', 0);
    return;
  }

  try {
    const firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    database = getFirestore(firebaseApp);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    onAuthStateChanged(
      auth,
      (user) => void applyAuthState(user),
      (error) => {
        console.error('Authentication state failed:', error);
        authReady = true;
        membershipState = 'error';
        renderSpinButton();
        setFeedStatus('LỖI ĐĂNG NHẬP', 'error');
        renderFeedMessage('Không thể khởi tạo Firebase Authentication.', 'error');
      }
    );
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    authReady = true;
    membershipState = 'error';
    renderSpinButton();
    setFeedStatus('LỖI CẤU HÌNH', 'error');
    renderFeedMessage('Firebase Web config không hợp lệ. Hãy kiểm tra firebase-config.js.', 'error');
    showNotice('Không thể khởi tạo Firebase. Hãy kiểm tra firebase-config.js.', 'error', 0);
  }
}

function syncSpinOutboxEntry(entry, authorName) {
  const existingPromise = spinSyncPromises.get(entry.id);
  if (existingPromise) return existingPromise;

  let syncPromise = null;
  syncPromise = (async () => {
    const spinReference = doc(database, 'spins', entry.id);
    const existingSpin = await getDoc(spinReference);
    if (existingSpin.exists()) {
      const existingData = existingSpin.data();
      if (existingData.uid !== entry.uid || existingData.foodId !== entry.foodId) {
        removeFromSpinOutbox(entry.id);
        const error = new Error('Spin outbox ID collision');
        error.code = 'spin/id-collision';
        throw error;
      }
      removeFromSpinOutbox(entry.id);
      return;
    }

    await setDoc(spinReference, {
      uid: entry.uid,
      authorName,
      foodId: entry.foodId,
      createdAt: serverTimestamp()
    });
    removeFromSpinOutbox(entry.id);
  })().finally(() => {
    if (spinSyncPromises.get(entry.id) === syncPromise) spinSyncPromises.delete(entry.id);
  });

  spinSyncPromises.set(entry.id, syncPromise);
  return syncPromise;
}

async function ensureSpinSyncedForDecision(spinId, actorUid, actorName) {
  const pendingEntry = spinOutbox.find((entry) => entry.id === spinId);
  if (!pendingEntry) return;
  if (pendingEntry.uid !== actorUid) {
    const error = new Error('Spin belongs to another auth session');
    error.code = 'decision/spin-unavailable';
    throw error;
  }

  let timeoutId = null;
  const timeoutPromise = new Promise((resolve, reject) => {
    timeoutId = window.setTimeout(() => {
      const error = new Error('Timed out while syncing selected spin');
      error.code = 'decision/spin-sync-timeout';
      reject(error);
    }, SPIN_SYNC_TIMEOUT);
  });

  try {
    await Promise.race([
      syncSpinOutboxEntry(pendingEntry, actorName),
      timeoutPromise
    ]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

function flushSpinOutbox() {
  if (outboxFlushPromise) return outboxFlushPromise;
  if (!database || !currentUser || membershipState !== 'allowed' || !memberDisplayName || !spinOutbox.length) {
    return Promise.resolve();
  }

  const ownerUid = currentUser.uid;
  const ownerName = memberDisplayName;
  outboxFlushPromise = (async () => {
    const pendingEntries = spinOutbox.filter((entry) => entry.uid === ownerUid);

    for (const entry of pendingEntries) {
      if (currentUser?.uid !== ownerUid || membershipState !== 'allowed') break;

      try {
        await syncSpinOutboxEntry(entry, ownerName);
      } catch (error) {
        console.error('Cannot flush shared spin:', error);
        if (error?.code === 'spin/id-collision') {
          showNotice('Một kết quả chờ đồng bộ bị xung đột và đã được bỏ qua.', 'error');
        } else {
          showNotice('Kết quả đã được giữ lại trên máy và sẽ tự đồng bộ khi kết nối phục hồi.', 'warning');
        }
        break;
      }
    }
  })().finally(() => {
    outboxFlushPromise = null;
  });

  return outboxFlushPromise;
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

function spin() {
  if (spinning) return;
  if (!currentUser || membershipState !== 'allowed' || !database) {
    showNotice('Bạn cần đăng nhập bằng tài khoản đã được duyệt trước khi quay.', 'warning');
    return;
  }
  if (resultDialog.open) resultDialog.close();

  spinning = true;
  spinOwner = currentUser;
  spinDocumentId = doc(collection(database, 'spins')).id;
  lastResult = nextWeightedRoundRobin();
  const reel = Array.from({ length: 58 }, () => weightedPick());
  reel[WINNER_INDEX] = lastResult;
  renderTrack(reel);

  rouletteTrack.style.transition = 'none';
  rouletteTrack.style.transform = 'translate3d(0, 0, 0)';
  rouletteTrack.getBoundingClientRect();

  renderSpinButton();
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
  const completedBy = spinOwner;
  const completedDocumentId = spinDocumentId;
  lastCompletedSpinId = completedDocumentId;
  spinOwner = null;
  spinDocumentId = null;
  spinning = false;
  spinCount += 1;
  spinCountElement.textContent = String(spinCount);
  history.unshift({ foodId: food.id, timestamp: Date.now() });
  history = history.slice(0, 8);
  saveProgress();
  renderHistory();
  renderSpinButton();
  statusText.textContent = `Đã mở được ${food.name} — ${rarityInfo[food.rarity].label}!`;
  playTone(food.rarity === 'legendary' ? 1040 : 820, 0.18, 0.06);
  showResult(food);
  queueSharedSpin(food, completedBy, completedDocumentId);
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

  updateAcceptResultButton();
  resultDialog.showModal();
  launchConfetti(rarity.color, food.rarity === 'legendary' ? 70 : 38);
}

function launchConfetti(primaryColor, count) {
  if (reducedMotion) return;
  const colors = [primaryColor, '#ffffff', '#ec1c24', '#d71920'];
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
signInButton.addEventListener('click', () => void signInWithGoogle());
signOutButton.addEventListener('click', () => void signOutUser());
communityFeed.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const reactionButton = target?.closest('.reaction-button');
  if (reactionButton) {
    void toggleReaction(reactionButton.dataset.spinId, reactionButton.dataset.reaction);
    return;
  }

  const decisionButton = target?.closest('.decision-button');
  if (decisionButton) {
    void finalizeDailyDecision(decisionButton.dataset.spinId, decisionButton.dataset.foodId);
  }
});
userAvatar.addEventListener('error', () => {
  userAvatar.hidden = true;
  userAvatarFallback.hidden = false;
});
rerollButton.addEventListener('click', () => {
  resultDialog.close();
  window.setTimeout(spin, 180);
});
closeDialogButton.addEventListener('click', () => resultDialog.close());
acceptResultButton.addEventListener('click', () => {
  if (acceptResultButton.disabled) return;
  const completedSpinId = lastCompletedSpinId;
  const completedFoodId = lastResult?.id || null;
  if (completedSpinId && completedFoodId) {
    void finalizeDailyDecision(completedSpinId, completedFoodId);
    resultDialog.close();
  }
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
window.addEventListener('online', () => void flushSpinOutbox());
window.setInterval(() => {
  if (database && membershipState === 'allowed' && getTodayKey() !== dailyDecisionDateKey) {
    subscribeToDailyDecision();
  }
}, 60000);

buildIdleTrack();
renderOdds();
renderHistory();
spinCountElement.textContent = String(spinCount);
renderFeedMessage('Đang khởi tạo kết nối Firebase...', 'loading');
renderDailyDecision();
renderAuthControls();
renderSpinButton();
initializeFirebaseServices();
